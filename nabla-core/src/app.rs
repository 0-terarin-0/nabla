//! High-level simulation runner shared by the Tauri app and nabla-server.
//!
//! Takes a TOML configuration as a string plus any user-supplied files,
//! runs the simulation in a temporary directory, and returns the results
//! (ZIP archive, KML files and map marker data) in a serializable form.

use std::collections::HashMap;
use std::fs;
use std::io::{Cursor, Write};
use std::path::{Component, Path, PathBuf};

use anyhow::{Context, Result, anyhow, bail};
use nalgebra::{DVector, Vector3};
use rayon::prelude::*;
use serde::Serialize;
use zip::write::SimpleFileOptions;

use crate::parameter::Parameter;
use crate::post_process::{export_csv, export_kml, export_loop_kml, magnetic_north_index, ned2llh};
use crate::solver::{solve_parachute, solve_trajectory};

/// Default configuration shown in the GUI on startup.
pub const DEFAULT_CONFIG: &str = include_str!("default_config.toml");

/// A user-supplied input file (thrust curve, wind profile, ...).
/// `name` is a path relative to the config file, e.g. `config/thrust.csv`.
pub struct ExtraFile {
    pub name: String,
    pub content: Vec<u8>,
}

/// Landing point for wind blowing from magnetic north.
#[derive(Debug, Clone, Serialize)]
pub struct NorthWindPoint {
    pub lat: f64,
    pub lon: f64,
    pub wind_speed: f64,
}

#[derive(Debug, Serialize)]
pub struct SimulationResult {
    pub zip_bytes: Vec<u8>,
    pub kml_files: HashMap<String, String>,
    pub launch_pos: (f64, f64),
    pub launch_radius: f64,
    pub safety_area: Vec<Vec<f64>>,
    pub ignition_pos: Option<(f64, f64)>,
    pub ignition_radius: f64,
    /// Parachute landing points for magnetic-north wind (one per wind speed).
    pub north_wind_points: Vec<NorthWindPoint>,
    /// Ballistic landing points for magnetic-north wind (one per wind speed).
    pub north_wind_points_traj: Vec<NorthWindPoint>,
    /// Magnetic declination [deg], east positive (Japan: negative = west).
    pub mag_dec: f64,
    /// Total impulse of the thrust curve used [N·s].
    pub total_impulse: f64,
}

/// Run a simulation.
///
/// * `fallback_dirs` – directories searched (in order) for default input files.
///   Files from the first existing directory are copied into `config/` before
///   `extra_files` are written, so user uploads always take precedence.
pub fn run_simulation(
    config_content: &str,
    is_loop: bool,
    extra_files: &[ExtraFile],
    fallback_dirs: &[PathBuf],
) -> Result<SimulationResult> {
    let temp_dir = tempfile::Builder::new().prefix("nabla_sim").tempdir()?;
    let dir_path = temp_dir.path();

    let config_path = dir_path.join("config.toml");
    fs::write(&config_path, config_content)?;

    copy_fallback_files(&dir_path.join("config"), fallback_dirs)?;

    for file in extra_files {
        let file_path = dir_path.join(sanitize_relative_path(&file.name)?);
        if let Some(parent) = file_path.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::write(file_path, &file.content)?;
    }

    let param = Parameter::new(&config_path)
        .map_err(|e| anyhow!("Failed to parse config: {:#}", e))?;

    let mut north_wind_points = Vec::new();
    let mut north_wind_points_traj = Vec::new();

    if is_loop {
        (north_wind_points, north_wind_points_traj) = run_loop(&param, dir_path)?;
    } else {
        run_nominal(&param, dir_path)?;
    }

    let (zip_bytes, kml_files) = collect_outputs(dir_path)?;
    let markers = parse_markers(config_content);

    Ok(SimulationResult {
        zip_bytes,
        kml_files,
        launch_pos: (param.launch.llh[0], param.launch.llh[1]),
        launch_radius: markers.launch_radius,
        safety_area: markers.safety_area,
        ignition_pos: markers.ignition_pos,
        ignition_radius: markers.ignition_radius,
        north_wind_points,
        north_wind_points_traj,
        mag_dec: param.launch.mag_dec,
        total_impulse: param.engine.total_impulse,
    })
}

/// Reject absolute paths and `..` so uploaded file names cannot escape the work directory.
fn sanitize_relative_path(name: &str) -> Result<PathBuf> {
    let path = Path::new(name);
    let mut out = PathBuf::new();
    for comp in path.components() {
        match comp {
            Component::Normal(c) => out.push(c),
            Component::CurDir => {}
            _ => bail!("Invalid file name: {name}"),
        }
    }
    if out.as_os_str().is_empty() {
        bail!("Invalid file name: {name}");
    }
    Ok(out)
}

fn copy_fallback_files(dest: &Path, fallback_dirs: &[PathBuf]) -> Result<()> {
    fs::create_dir_all(dest)?;
    let Some(src_dir) = fallback_dirs.iter().find(|d| d.is_dir()) else {
        return Ok(());
    };
    for entry in fs::read_dir(src_dir)?.flatten() {
        if entry.file_type().map(|t| t.is_file()).unwrap_or(false) {
            let _ = fs::copy(entry.path(), dest.join(entry.file_name()));
        }
    }
    Ok(())
}

fn path_str(dir: &Path, name: &str) -> Result<String> {
    dir.join(name)
        .to_str()
        .map(str::to_owned)
        .context("Non UTF-8 temporary path")
}

fn apogee_index(state_log: &[DVector<f64>]) -> usize {
    // NED frame: altitude is -z, so apogee is the minimum z.
    let mut idx = 0;
    let mut min_z = state_log[0][2];
    for (i, state) in state_log.iter().enumerate() {
        if state[2] < min_z {
            min_z = state[2];
            idx = i;
        }
    }
    idx
}

fn pos(state: &DVector<f64>) -> Vector3<f64> {
    Vector3::new(state[0], state[1], state[2])
}

fn north_point(param: &Parameter, ned: &Vector3<f64>, wind_speed: f64) -> NorthWindPoint {
    let lla = ned2llh(&param.launch.llh, ned);
    NorthWindPoint {
        lat: lla[0],
        lon: lla[1],
        wind_speed,
    }
}

/// Dispersion (wind speed × azimuth) analysis. Returns north-wind landing points
/// (parachute, ballistic).
fn run_loop(param: &Parameter, dir: &Path) -> Result<(Vec<NorthWindPoint>, Vec<NorthWindPoint>)> {
    let (speeds, azimuths) = param.get_wind_array();
    let jobs: Vec<_> = (0..speeds.len())
        .flat_map(|i| (0..azimuths.len()).map(move |j| (i, j)))
        .collect();

    let results: Vec<_> = jobs
        .into_par_iter()
        .map(|(i, j)| {
            let mut local_param = param.clone();
            local_param.wind.set_power_model(speeds[i], azimuths[j]);

            let (_, state_log) = solve_trajectory(&local_param);
            let pos_apogee = pos(&state_log[apogee_index(&state_log)]);
            let (_, state_para) =
                solve_parachute(&local_param, &local_param.para, 0.0, &pos_apogee);

            let hard = pos(state_log.last().unwrap());
            let soft = state_para.last().map(pos).unwrap_or_else(Vector3::zeros);
            (i, j, hard, soft)
        })
        .collect();

    let mut pos_hard_matrix = vec![vec![Vector3::zeros(); azimuths.len()]; speeds.len()];
    let mut pos_soft_matrix = vec![vec![Vector3::zeros(); azimuths.len()]; speeds.len()];
    let mut north_points = Vec::new();
    let mut north_points_traj = Vec::new();

    let north_idx = magnetic_north_index(&azimuths);
    for (i, j, hard, soft) in results {
        pos_hard_matrix[i][j] = hard;
        pos_soft_matrix[i][j] = soft;
        // Wind azimuth is measured from magnetic north (declination is applied in Wind).
        if Some(j) == north_idx {
            north_points_traj.push(north_point(param, &hard, speeds[i]));
            if param.para.vel_para_1st > 0.0 {
                north_points.push(north_point(param, &soft, speeds[i]));
            }
        }
    }

    export_loop_kml(
        &path_str(dir, "land_map_trajectory.kml")?,
        &param.launch.llh,
        &pos_hard_matrix,
        &speeds,
        &azimuths,
        param.launch.mag_dec,
        "ff00aaff",
    )?;
    export_loop_kml(
        &path_str(dir, "land_map_parachute.kml")?,
        &param.launch.llh,
        &pos_soft_matrix,
        &speeds,
        &azimuths,
        param.launch.mag_dec,
        "ffffff00",
    )?;

    Ok((north_points, north_points_traj))
}

/// Single nominal flight.
fn run_nominal(param: &Parameter, dir: &Path) -> Result<()> {
    let (time_log, state_log) = solve_trajectory(param);
    if time_log.is_empty() {
        bail!("Simulation returned no data.");
    }

    let apogee_idx = apogee_index(&state_log);
    let (time_para, state_para) = solve_parachute(
        param,
        &param.para,
        time_log[apogee_idx],
        &pos(&state_log[apogee_idx]),
    );

    export_csv(&path_str(dir, "trajectory_log.csv")?, &time_log, &state_log)?;
    export_csv(&path_str(dir, "parachute_log.csv")?, &time_para, &state_para)?;

    let pos_hard: Vec<_> = state_log.iter().map(pos).collect();
    let pos_soft: Vec<_> = state_para.iter().map(pos).collect();
    export_kml(
        &path_str(dir, "flight_log.kml")?,
        param.payload.exist,
        &param.launch.llh,
        &pos_hard,
        &pos_soft,
        None,
    )?;
    Ok(())
}

/// Zip all `*_log.csv` and `*.kml` outputs, and return KML contents for map rendering.
fn collect_outputs(dir: &Path) -> Result<(Vec<u8>, HashMap<String, String>)> {
    let mut buf = Vec::new();
    let mut kml_files = HashMap::new();
    {
        let mut zip = zip::ZipWriter::new(Cursor::new(&mut buf));
        let options =
            SimpleFileOptions::default().compression_method(zip::CompressionMethod::Stored);

        for entry in fs::read_dir(dir)? {
            let path = entry?.path();
            if !path.is_file() {
                continue;
            }
            let name = path.file_name().unwrap().to_string_lossy().to_string();
            if !(name.ends_with("_log.csv") || name.ends_with(".kml")) {
                continue;
            }
            let bytes = fs::read(&path)?;
            zip.start_file(name.clone(), options)?;
            zip.write_all(&bytes)?;
            if name.ends_with(".kml")
                && let Ok(content) = String::from_utf8(bytes)
            {
                kml_files.insert(name, content);
            }
        }
        zip.finish()?;
    }
    Ok((buf, kml_files))
}

struct Markers {
    launch_radius: f64,
    ignition_pos: Option<(f64, f64)>,
    ignition_radius: f64,
    safety_area: Vec<Vec<f64>>,
}

/// Extract map-only fields (not used by the solver) from the raw TOML.
fn parse_markers(config_content: &str) -> Markers {
    let mut m = Markers {
        launch_radius: 0.0,
        ignition_pos: None,
        ignition_radius: 10.0,
        safety_area: Vec::new(),
    };

    let Ok(toml_val) = toml::from_str::<toml::Value>(config_content) else {
        return m;
    };
    let as_f64 = |v: &toml::Value| v.as_float().or_else(|| v.as_integer().map(|i| i as f64));

    if let Some(r) = toml_val
        .get("Launcher")
        .and_then(|l| l.get("radius"))
        .and_then(as_f64)
    {
        m.launch_radius = r;
    }

    if let Some(ig) = toml_val.get("IgnitionArea") {
        if let Some(r) = ig.get("radius").and_then(as_f64) {
            m.ignition_radius = r;
        }
        if let (Some(lat), Some(lon)) = (
            ig.get("lat").and_then(as_f64),
            ig.get("lon").and_then(as_f64),
        ) {
            m.ignition_pos = Some((lat, lon));
        }
    }

    if let Some(coords) = toml_val
        .get("SafetyArea")
        .and_then(|s| s.get("coordinates"))
        .and_then(|c| c.as_array())
    {
        m.safety_area = coords
            .iter()
            .filter_map(|p| {
                let p = p.as_array()?;
                match (p.first().and_then(as_f64), p.get(1).and_then(as_f64)) {
                    (Some(lat), Some(lon)) if p.len() == 2 => Some(vec![lat, lon]),
                    _ => None,
                }
            })
            .collect();
    }

    m
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_config_markers() {
        let m = parse_markers(DEFAULT_CONFIG);
        assert_eq!(m.launch_radius, 20.0);
        assert_eq!(m.ignition_pos, Some((34.2860, 135.0910)));
        assert_eq!(m.ignition_radius, 10.0);
        assert_eq!(m.safety_area.len(), 15);
    }

    #[test]
    fn rejects_path_traversal() {
        assert!(sanitize_relative_path("../etc/passwd").is_err());
        assert!(sanitize_relative_path("/etc/passwd").is_err());
        assert!(sanitize_relative_path("").is_err());
        assert_eq!(
            sanitize_relative_path("./config/thrust.csv").unwrap(),
            PathBuf::from("config/thrust.csv")
        );
    }
}
