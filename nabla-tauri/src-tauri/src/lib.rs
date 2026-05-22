use nabla_core::parameter::Parameter;
use nabla_core::post_process::{export_csv, export_kml, export_loop_kml};
use nabla_core::solver::{solve_parachute, solve_trajectory};
use nalgebra::{DVector, Vector3};
use rayon::prelude::*;
use std::fs::{self, File};
use std::io::{Cursor, Read, Write};
use std::path::PathBuf;
use zip::write::SimpleFileOptions;

#[tauri::command]
fn get_default_config() -> String {
    r#"[Solver]
name = "nabla-gui"
dt = 0.01
t_max = 1000.0

[MonteCarlo]
speed_min = 0.0
speed_step = 1.0
speed_num = 9
azimuth_min = 0.0
azimuth_num = 16

[Launcher]
lat = 34.2852
lon = 135.09059
height = 90.0
mag_dec = 7.4
launch_elevation = 85.0
launch_azimuth = 315.0
rail_length = 5.0
radius = 20.0

[Wind]
wind_speed = 1.0
wind_azimuth = 0.0
wind_power_coeff = 4.5
wind_alt_ref = 2.0
exist_wind_file = true
wind_file = "config/nichikagon_wind.csv"

[Geometry]
diameter = 114.0
length = 1320.0
mass_dry = 6.138
lcg_dry = 780.0
Ij_dry_roll = 0.009
Ij_dry_pitch = 1.042

[Aerodynamics]
lcp = 540.0
CA = 0.41
CNa = 5.436
Clp = -0.0296
Cmq = -2.11
exsist_lcp_file = false
exsist_CA_file = false
exsist_CNa_file = false
lcp_file = ""
CA_file = ""
CNa_file = ""

[Engine]
mass_ox = 0.2739
mass_fuel_bef = 0.38
mass_fuel_aft = 0.352
lcg_ox = 136.5
lcg_fuel = 136.0
l_tank_cap = 273.0
thrust_file = "config/thrust_example.csv"

[Parachute]
vel_para_1st = 8.80
exist_2nd_para = false
vel_para_2nd = 12.83
2nd_para_timer = false
alt_para_2nd = 300.0
time_2nd = 20.0

[Payload]
exist_payload = false
mass_payload = 1.0
vel_payload = 11.55

[SafetyArea]
coordinates = [
    [34.285604, 135.093313],
    [34.285698, 135.092503],
    [34.286411, 135.092401],
    [34.286863, 135.091339],
    [34.287492, 135.089311],
    [34.286140, 135.088726],
    [34.286634, 135.087086],
    [34.283611, 135.087193],
    [34.283675, 135.088155],
    [34.283486, 135.088878],
    [34.282289, 135.090412],
    [34.282672, 135.090973],
    [34.282842, 135.091651],
    [34.283453, 135.092365],
    [34.284049, 135.092649]
]

[IgnitionArea]
lat = 34.2860
lon = 135.0910
radius = 10.0
"#
    .to_string()
}

#[derive(serde::Deserialize)]
pub struct ExtraFile {
    name: String,
    content: String,
}

#[derive(serde::Serialize)]
pub struct SimulationResult {
    zip_bytes: Vec<u8>,
    kml_files: std::collections::HashMap<String, String>,
    launch_pos: (f64, f64),
    launch_radius: f64,
    safety_area: Vec<Vec<f64>>,
    ignition_pos: Option<(f64, f64)>,
    ignition_radius: f64,
    north_wind_points: Vec<(f64, f64)>,
    north_wind_points_traj: Vec<(f64, f64)>,
}

#[tauri::command]
async fn run_simulation(
    config_content: String,
    is_loop: bool,
    extra_files: Vec<ExtraFile>,
) -> Result<SimulationResult, String> {
    let temp_dir = tempfile::Builder::new()
        .prefix("nabla_sim")
        .tempdir()
        .map_err(|e| e.to_string())?;
    let dir_path = temp_dir.path();

    let config_path = dir_path.join("config.toml");
    fs::write(&config_path, &config_content).map_err(|e| e.to_string())?;

    let config_dir_dest = dir_path.join("config");
    fs::create_dir_all(&config_dir_dest).map_err(|e| e.to_string())?;

    let possible_src_dirs = vec![
        PathBuf::from("../../nabla-cli/config"),
        PathBuf::from("../nabla-cli/config"),
        PathBuf::from("nabla-cli/config"),
    ];

    for src_dir in possible_src_dirs {
        if src_dir.exists() {
            if let Ok(entries) = fs::read_dir(&src_dir) {
                for entry in entries.flatten() {
                    if let Ok(file_type) = entry.file_type() {
                        if file_type.is_file() {
                            let dest_path = config_dir_dest.join(entry.file_name());
                            let _ = fs::copy(entry.path(), dest_path);
                        }
                    }
                }
            }
            break;
        }
    }

    for file in extra_files {
        let file_path = dir_path.join(&file.name);
        if let Some(parent) = file_path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        let _ = fs::write(file_path, file.content);
    }

    let mut global_north_points = Vec::new();
    let mut global_north_points_traj = Vec::new();

    let param =
        Parameter::new(&config_path).map_err(|e| format!("Failed to parse config: {}", e))?;

    if is_loop {
        let (speeds, azimuths) = param.get_wind_array();
        let mut jobs = Vec::new();
        for (i, &speed) in speeds.iter().enumerate() {
            for (j, &azimuth) in azimuths.iter().enumerate() {
                jobs.push((i, j, speed, azimuth));
            }
        }

        let results: Vec<_> = jobs
            .into_par_iter()
            .map(|(i, j, speed, azimuth)| {
                let mut local_param = param.clone();
                local_param.wind.set_power_model(speed, azimuth);

                let (_, state_log) = solve_trajectory(&local_param);

                let mut min_z = state_log[0][2];
                let mut apogee_idx = 0;
                for (idx, state) in state_log.iter().enumerate() {
                    if state[2] < min_z {
                        min_z = state[2];
                        apogee_idx = idx;
                    }
                }

                let state_apogee = &state_log[apogee_idx];
                let pos_apogee = Vector3::new(state_apogee[0], state_apogee[1], state_apogee[2]);

                let (_, state_para) =
                    solve_parachute(&local_param, &local_param.para, 0.0, &pos_apogee);

                let land_state_hard = state_log.last().unwrap();
                let default_state = DVector::zeros(3);
                let land_state_soft = state_para.last().unwrap_or(&default_state);

                (
                    i,
                    j,
                    Vector3::new(land_state_hard[0], land_state_hard[1], land_state_hard[2]),
                    Vector3::new(land_state_soft[0], land_state_soft[1], land_state_soft[2]),
                )
            })
            .collect();

        let mut pos_hard_matrix = vec![vec![Vector3::zeros(); azimuths.len()]; speeds.len()];
        let mut pos_soft_matrix = vec![vec![Vector3::zeros(); azimuths.len()]; speeds.len()];
        let mut north_wind_points_loop = Vec::new();
        let mut north_wind_points_traj_loop = Vec::new();



        for (i, j, hard, soft) in results {
            pos_hard_matrix[i][j] = hard;
            pos_soft_matrix[i][j] = soft;
            if (azimuths[j] % 360.0).abs() < 1e-6 {
                let lla_hard = nabla_core::post_process::ned2llh(&param.launch.llh, &hard);
                north_wind_points_traj_loop.push((lla_hard[0], lla_hard[1]));
                if param.para.vel_para_1st > 0.0 {
                    let lla_soft = nabla_core::post_process::ned2llh(&param.launch.llh, &soft);
                    north_wind_points_loop.push((lla_soft[0], lla_soft[1]));
                }
            }


        }

        export_loop_kml(
            dir_path.join("land_map_trajectory.kml").to_str().unwrap(),
            &param.launch.llh,
            &pos_hard_matrix,
            &speeds,
            "ff00aaff",
        )
        .map_err(|e| e.to_string())?;

        global_north_points = north_wind_points_loop;
        global_north_points_traj = north_wind_points_traj_loop;

        export_loop_kml(
            dir_path.join("land_map_parachute.kml").to_str().unwrap(),
            &param.launch.llh,
            &pos_soft_matrix,
            &speeds,
            "ffffff00",
        )
        .map_err(|e| e.to_string())?;
    } else {
        let (time_log, state_log) = solve_trajectory(&param);
        if time_log.is_empty() {
            return Err("Simulation returned no data.".into());
        }

        let mut apogee_idx = 0;
        let mut min_z = state_log[0][2];
        for (i, state) in state_log.iter().enumerate() {
            if state[2] < min_z {
                min_z = state[2];
                apogee_idx = i;
            }
        }

        let time_apogee = time_log[apogee_idx];
        let state_apogee = &state_log[apogee_idx];
        let pos_apogee = Vector3::new(state_apogee[0], state_apogee[1], state_apogee[2]);

        let (time_para, state_para) =
            solve_parachute(&param, &param.para, time_apogee, &pos_apogee);

        export_csv(
            dir_path.join("trajectory_log.csv").to_str().unwrap(),
            &time_log,
            &state_log,
        )
        .map_err(|e| e.to_string())?;
        
        export_csv(
            dir_path.join("parachute_log.csv").to_str().unwrap(),
            &time_para,
            &state_para,
        )
        .map_err(|e| e.to_string())?;

        let pos_hard: Vec<Vector3<f64>> = state_log
            .iter()
            .map(|s| Vector3::new(s[0], s[1], s[2]))
            .collect();
        let pos_soft: Vec<Vector3<f64>> = state_para
            .iter()
            .map(|s| Vector3::new(s[0], s[1], s[2]))
            .collect();

        export_kml(
            dir_path.join("flight_log.kml").to_str().unwrap(),
            param.payload.exist,
            &param.launch.llh,
            &pos_hard,
            &pos_soft,
            None,
        )
        .map_err(|e| e.to_string())?;
    }

    let mut buf = Vec::new();
    let mut kml_files = std::collections::HashMap::new();
    {
        let cursor = Cursor::new(&mut buf);
        let mut zip = zip::ZipWriter::new(cursor);
        let options =
            SimpleFileOptions::default().compression_method(zip::CompressionMethod::Stored);

        let files = fs::read_dir(dir_path).map_err(|e| e.to_string())?;
        for entry in files {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            if path.is_file() {
                let name = path.file_name().unwrap().to_string_lossy().to_string();
                if name.ends_with("_log.csv") || name.ends_with(".kml") {
                    zip.start_file(name.clone(), options)
                        .map_err(|e| e.to_string())?;
                    let mut f = File::open(&path).map_err(|e| e.to_string())?;
                    let mut file_buf = Vec::new();
                    f.read_to_end(&mut file_buf).map_err(|e| e.to_string())?;
                    zip.write_all(&file_buf).map_err(|e| e.to_string())?;

                    if name.ends_with(".kml") {
                        if let Ok(content) = String::from_utf8(file_buf) {
                            kml_files.insert(name, content);
                        }
                    }
                }
            }
        }
        zip.finish().map_err(|e| e.to_string())?;
    }

    let launch_pos = (param.launch.llh[0], param.launch.llh[1]);

    let mut safety_area = Vec::new();
    let mut in_safety_area = false;
    let mut ignition_radius = 10.0;
    let mut ignition_pos = None;
    let mut launch_radius = 0.0;

    if let Ok(toml_val) = toml::from_str::<toml::Value>(&config_content) {
        if let Some(launcher_val) = toml_val.get("Launcher") {
            if let Some(r) = launcher_val.get("radius").and_then(|v| v.as_float()) {
                launch_radius = r;
            } else if let Some(r) = launcher_val.get("radius").and_then(|v| v.as_integer()) {
                launch_radius = r as f64;
            }
        }

        if let Some(ig_val) = toml_val.get("IgnitionArea") {
            if let Some(r) = ig_val.get("radius").and_then(|v| v.as_float()) {
                ignition_radius = r;
            } else if let Some(r) = ig_val.get("radius").and_then(|v| v.as_integer()) {
                ignition_radius = r as f64;
            }
            
            if let (Some(lat), Some(lon)) = (
                ig_val.get("lat").and_then(|v| v.as_float()),
                ig_val.get("lon").and_then(|v| v.as_float()),
            ) {
                ignition_pos = Some((lat, lon));
            }
        }
    }

    for line in config_content.lines() {
        let line = line.trim();
        if line.starts_with("[SafetyArea]") {
            in_safety_area = true;
            continue;
        } else if line.starts_with('[') && !line.contains(',') && in_safety_area {
            in_safety_area = false;
        }

        if in_safety_area {
            if let Some(start) = line.find('[') {
                if let Some(end) = line.find(']') {
                    if start < end {
                        let inner = &line[start + 1..end];
                        let parts: Vec<&str> = inner.split(',').map(|s| s.trim()).collect();
                        if parts.len() == 2 {
                            if let (Ok(lat), Ok(lon)) =
                                (parts[0].parse::<f64>(), parts[1].parse::<f64>())
                            {
                                safety_area.push(vec![lat, lon]);
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(SimulationResult {
        zip_bytes: buf,
        kml_files,
        launch_pos,
        launch_radius,
        safety_area,
        ignition_pos,
        ignition_radius,
        north_wind_points: global_north_points,
        north_wind_points_traj: global_north_points_traj,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![get_default_config, run_simulation])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
