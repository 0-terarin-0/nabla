use anyhow::Result;
use nabla::parameter::Parameter;
use nabla::post_process::{export_csv, export_kml};
use nabla::solver::{solve_parachute, solve_trajectory};
use nalgebra::{DVector, Vector3};
use rayon::prelude::*;
use std::env;
use std::path::Path;
use std::time::Instant;

fn main() -> Result<()> {
    let args: Vec<String> = env::args().collect();
    let is_loop = args.iter().any(|arg| arg == "--loop");

    let config_path = args
        .get(1)
        .map(String::as_str)
        .unwrap_or("miniQuabla/example/rocket_config.csv");
    if !Path::new(config_path).exists() {
        eprintln!("Configuration file not found: {}", config_path);
        eprintln!("Please run this command from the nabla project root.");
        return Ok(());
    }

    println!("--- miniQuabla Rust Port ---");
    println!("Loading configuration from {} ...", config_path);
    let param = Parameter::new(config_path)?;

    if is_loop {
        println!("\n--- Starting Loop (Dispersion) Simulation ---");
        let start_time = Instant::now();
        let (speeds, azimuths) = param.get_wind_array();

        // 落下分散計算用のジョブ（風向・風速の組み合わせ）を作成
        let mut jobs = Vec::new();
        for (i, &speed) in speeds.iter().enumerate() {
            for (j, &azimuth) in azimuths.iter().enumerate() {
                jobs.push((i, j, speed, azimuth));
            }
        }

        let total_jobs = jobs.len();
        println!("Total conditions to compute: {}", total_jobs);

        // Rayon を用いて並列に軌道計算とパラシュート降下計算を行う
        let results: Vec<_> = jobs
            .par_iter()
            .map(|&(i, j, speed, azimuth)| {
                let mut local_param = param.clone();
                local_param.wind.set_power_model(speed, azimuth);

                let (_, state_log) = solve_trajectory(&local_param);

                let mut min_z = state_log[0][2];
                let mut apogee_idx = 0;
                for (i, state) in state_log.iter().enumerate() {
                    if state[2] < min_z {
                        min_z = state[2];
                        apogee_idx = i;
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

        let elapsed = start_time.elapsed();

        // 各条件の着地点を収集
        let mut pos_hard_matrix = vec![vec![Vector3::zeros(); azimuths.len()]; speeds.len()];
        let mut pos_soft_matrix = vec![vec![Vector3::zeros(); azimuths.len()]; speeds.len()];

        for (i, j, hard, soft) in results {
            pos_hard_matrix[i][j] = hard;
            pos_soft_matrix[i][j] = soft;
        }

        // KMLファイルに出力して落下分散を確認できるようにする
        nabla::post_process::export_loop_kml(
            "land_map_trajectory.kml",
            &param.launch.llh,
            &pos_hard_matrix,
            &speeds,
            "ff00aaff",
        )?;
        nabla::post_process::export_loop_kml(
            "land_map_parachute.kml",
            &param.launch.llh,
            &pos_soft_matrix,
            &speeds,
            "ffffff00",
        )?;

        println!(
            "Exported dispersion results to land_map_trajectory.kml and land_map_parachute.kml"
        );
        println!("Loop Simulation Time : {:.2?}", elapsed);

        return Ok(());
    }

    println!("\nCalculating trajectory...");
    let start_time = Instant::now();
    let (time_log, state_log) = solve_trajectory(&param);
    let traj_duration = start_time.elapsed();

    if time_log.is_empty() {
        eprintln!("Simulation returned no data.");
        return Ok(());
    }

    // Find apogee (min Z in NED frame corresponds to max altitude)
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
    let max_altitude = -pos_apogee[2];

    println!(
        "-> Apogee reached: {:.2} m at {:.2} s",
        max_altitude, time_apogee
    );

    println!("\nCalculating parachute descent...");
    let para_start_time = Instant::now();
    let (time_para, state_para) = solve_parachute(&param, &param.para, time_apogee, &pos_apogee);
    let para_duration = para_start_time.elapsed();

    let land_time = time_para.last().unwrap_or(&time_apogee);
    let default_state = DVector::zeros(3);
    let land_state = state_para.last().unwrap_or(&default_state);
    let land_distance = (land_state[0].powi(2) + land_state[1].powi(2)).sqrt();

    println!(
        "-> Landed: Distance {:.2} m from launch pad at {:.2} s",
        land_distance, land_time
    );

    if param.payload.exist {
        println!("-> (Note: Payload descent simulation is currently skipped in this run)");
    }

    println!("\nExporting results...");
    export_csv("trajectory_log.csv", &time_log, &state_log)?;
    export_csv("parachute_log.csv", &time_para, &state_para)?;

    let pos_hard: Vec<Vector3<f64>> = state_log
        .iter()
        .map(|s| Vector3::new(s[0], s[1], s[2]))
        .collect();
    let pos_soft: Vec<Vector3<f64>> = state_para
        .iter()
        .map(|s| Vector3::new(s[0], s[1], s[2]))
        .collect();

    export_kml(
        "flight_log.kml",
        param.payload.exist,
        &param.launch.llh,
        &pos_hard,
        &pos_soft,
        None,
    )?;
    println!("Exported to trajectory_log.csv, parachute_log.csv, and flight_log.kml");

    println!("\n--- Simulation Finished ---");
    println!("Solve ODE (Trajectory) : {:.2?}", traj_duration);
    println!("Solve ODE (Parachute)  : {:.2?}", para_duration);
    println!(
        "Total Calculation Time : {:.2?}",
        traj_duration + para_duration
    );

    Ok(())
}
