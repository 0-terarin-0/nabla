use axum::{
    Json, Router,
    extract::{DefaultBodyLimit, Multipart},
    http::{Method, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, post},
};
use nalgebra::Vector3;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::{Cursor, Read, Write};
use std::net::SocketAddr;
use std::path::PathBuf;
use tower_http::cors::{Any, CorsLayer};
use zip::write::SimpleFileOptions;

use nabla_core::parameter::Parameter;
use nabla_core::post_process::{export_csv, export_kml, export_loop_kml};
use nabla_core::solver::{solve_parachute, solve_trajectory};
use nalgebra::DVector;

#[derive(Serialize)]
struct DefaultConfigResponse {
    config: String,
}

#[derive(Serialize)]
struct SimulationResponse {
    zip_bytes: Vec<u8>,
    kml_files: std::collections::HashMap<String, String>,
    launch_pos: (f64, f64),
    safety_area: Vec<Vec<f64>>,
}

// Custom error type that implements IntoResponse
struct AppError(String);

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        (StatusCode::INTERNAL_SERVER_ERROR, self.0).into_response()
    }
}

impl<E> From<E> for AppError
where
    E: std::fmt::Display,
{
    fn from(err: E) -> Self {
        AppError(err.to_string())
    }
}

#[tokio::main]
async fn main() {
    // Use the most permissive CORS setup to ensure Axum never blocks requests.
    // Cloudflare fake-CORS errors are often due to 413/502 responses missing CORS headers,
    // so we make sure the layer is absolutely permissive.
    let cors = CorsLayer::permissive();

    let app = Router::new()
        .route("/health", get(|| async { "OK" }))
        .route("/api/config/default", get(get_default_config))
        .route("/api/simulate", post(run_simulation))
        // Increase payload size limit to 50MB to accommodate large CSV/Config files if necessary
        .layer(DefaultBodyLimit::max(50 * 1024 * 1024))
        .layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3001));
    println!("Nabla Server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn get_default_config() -> Json<DefaultConfigResponse> {
    let config = r#"[Solver]
name = "example"
dt = 0.01
t_max = 1000.0

[MonteCarlo]
speed_min = 0.0
speed_step = 1.0
speed_num = 9
azimuth_min = 45.0
azimuth_num = 16

[Launcher]
lat = 34.2852
lon = 135.09059
height = 90.0
mag_dec = 7.4
launch_elevation = 85.0
launch_azimuth = 315.0
rail_length = 5.0

[Wind]
wind_speed = 1.0
wind_azimuth = 0.0
wind_power_coeff = 4.5
wind_alt_ref = 2.0
exist_wind_file = true
wind_file = "wind_example.csv"

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
thrust_file = "thrust_example.csv"

[Parachute]
vel_para_1st = 8.805970788912555
exist_2nd_para = false
vel_para_2nd = 12.836678269815902
2nd_para_timer = false
alt_para_2nd = 300.0
time_2nd = 20.0

[Payload]
exist_payload = false
mass_payload = 1.0
vel_payload = 11.55092245337183

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
]"#
    .to_string();

    Json(DefaultConfigResponse { config })
}

async fn run_simulation(mut multipart: Multipart) -> Result<Json<SimulationResponse>, AppError> {
    println!(">>> Incoming request to /api/simulate");
    let mut config_content = String::new();
    let mut is_loop = false;

    let temp_dir = tempfile::Builder::new().prefix("nabla_sim").tempdir()?;
    let dir_path = temp_dir.path();

    // Recreate the config directory to handle potential relative file paths like `config/thrust.csv`
    let config_dir_dest = dir_path.join("config");
    fs::create_dir_all(&config_dir_dest)?;

    // Parse the multipart payload
    while let Some(field) = multipart.next_field().await? {
        let name = field.name().unwrap_or("").to_string();
        println!(">>> Received multipart field: {}", name);

        if name == "configContent" {
            config_content = field.text().await?;
        } else if name == "isLoop" {
            let val = field.text().await?;
            is_loop = val == "true";
        } else if name == "extraFiles" {
            // In a multipart form, you might send multiple files with the name `extraFiles`.
            // Alternatively, you could just send them with their relative file path as the field name.
            if let Some(filename) = field.file_name().map(|s| s.to_string()) {
                let bytes = field.bytes().await?;
                let file_path = dir_path.join(&filename);
                if let Some(parent) = file_path.parent() {
                    let _ = fs::create_dir_all(parent);
                }
                fs::write(file_path, bytes)?;
            }
        }
    }

    if config_content.is_empty() {
        println!(">>> Error: Missing configuration content");
        return Err(AppError("Missing configuration content".to_string()));
    }

    println!(
        ">>> Configuration parsed successfully ({} bytes). Executing simulation...",
        config_content.len()
    );

    // Write the provided configuration to a TOML file
    let config_path = dir_path.join("config.toml");
    fs::write(&config_path, &config_content)?;

    // Try to copy default files from the project root if they exist, to provide fallback
    // e.g., if the user did not upload `config/thrust_example.csv`
    let possible_src_dirs = vec![
        PathBuf::from("../nabla-cli/config"),
        PathBuf::from("nabla-cli/config"),
        PathBuf::from("./config"),
    ];

    for src_dir in possible_src_dirs {
        if src_dir.exists() {
            if let Ok(entries) = fs::read_dir(&src_dir) {
                for entry in entries.flatten() {
                    if let Ok(file_type) = entry.file_type() {
                        if file_type.is_file() {
                            let dest_path = config_dir_dest.join(entry.file_name());
                            if !dest_path.exists() {
                                let _ = fs::copy(entry.path(), dest_path);
                            }
                        }
                    }
                }
            }
            break; // Stop after finding the first valid source dir
        }
    }

    // Initialize parameters from the configuration
    let param =
        Parameter::new(&config_path).map_err(|e| format!("Failed to parse config: {}", e))?;

    // Run the simulation (logic identical to Tauri)
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

        for (i, j, hard, soft) in results {
            pos_hard_matrix[i][j] = hard;
            pos_soft_matrix[i][j] = soft;
        }

        export_loop_kml(
            dir_path.join("land_map_trajectory.kml").to_str().unwrap(),
            &param.launch.llh,
            &pos_hard_matrix,
            &speeds,
            "ff00aaff",
        )?;

        export_loop_kml(
            dir_path.join("land_map_parachute.kml").to_str().unwrap(),
            &param.launch.llh,
            &pos_soft_matrix,
            &speeds,
            "ffffff00",
        )?;
    } else {
        let (time_log, state_log) = solve_trajectory(&param);
        if time_log.is_empty() {
            return Err(AppError("Simulation returned no data.".into()));
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
        )?;

        export_csv(
            dir_path.join("parachute_log.csv").to_str().unwrap(),
            &time_para,
            &state_para,
        )?;

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
        )?;
    }

    // Zip all generated output files (.csv and .kml)
    let mut buf = Vec::new();
    let mut kml_files = std::collections::HashMap::new();
    {
        let cursor = Cursor::new(&mut buf);
        let mut zip = zip::ZipWriter::new(cursor);
        let options =
            SimpleFileOptions::default().compression_method(zip::CompressionMethod::Stored);

        let files = fs::read_dir(dir_path)?;
        for entry in files {
            let entry = entry?;
            let path = entry.path();
            if path.is_file() {
                let name = path.file_name().unwrap().to_string_lossy().to_string();
                if name.ends_with("_log.csv") || name.ends_with(".kml") {
                    zip.start_file(name.clone(), options)?;
                    let mut f = File::open(&path)?;
                    let mut file_buf = Vec::new();
                    f.read_to_end(&mut file_buf)?;
                    zip.write_all(&file_buf)?;

                    if name.ends_with(".kml") {
                        if let Ok(content) = String::from_utf8(file_buf) {
                            kml_files.insert(name, content);
                        }
                    }
                }
            }
        }
        zip.finish()?;
    }

    let launch_pos = (param.launch.llh[0], param.launch.llh[1]);

    let mut safety_area = Vec::new();
    let mut in_safety_area = false;
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

    println!(">>> Simulation complete. Returning results to client.");
    Ok(Json(SimulationResponse {
        zip_bytes: buf,
        kml_files,
        launch_pos,
        safety_area,
    }))
}
