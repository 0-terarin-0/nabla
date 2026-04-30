use std::collections::HashMap;
use std::fs::File;
use std::io::{BufRead, BufReader};
use std::path::Path;

use anyhow::Context;
use nalgebra::{UnitQuaternion, Vector3};

use crate::aerodynamic::{Aerodynamic, AerodynamicConfig};
use crate::atmosphere::Atmosphere;
use crate::engine::{Engine, EngineConfig};
use crate::geometry::{Geometry, GeometryConfig};
use crate::launcher::{Launcher, LauncherConfig};
use crate::parachute::{Parachute, ParachuteConfig};
use crate::payload::{Payload, PayloadConfig};
use crate::wind::{Wind, WindConfig};

#[derive(Clone)]
pub struct Parameter {
    pub name: String,
    pub dt: f64,
    pub t_max: f64,

    pub aero: Aerodynamic,
    pub atmos: Atmosphere,
    pub wind: Wind,
    pub engine: Engine,
    pub geomet: Geometry,
    pub launch: Launcher,
    pub para: Parachute,
    pub payload: Payload,

    pub speed_min: f64,
    pub speed_step: f64,
    pub speed_num: usize,
    pub azimuth_min: f64,
    pub azimuth_num: usize,
}

impl Parameter {
    pub fn new<P: AsRef<Path>>(path_config: P) -> anyhow::Result<Self> {
        let path_config = path_config.as_ref();
        let base_dir = path_config.parent().unwrap_or_else(|| Path::new(""));
        let raw_config = Self::read_config(path_config)?;
        let json_value = Self::allocate_df(&raw_config)?;

        // Deserialize Config structs from json
        let aero_cfg: AerodynamicConfig =
            serde_json::from_value(json_value["Aerodynamics"].clone())?;
        let wind_cfg: WindConfig = serde_json::from_value(json_value["Wind"].clone())?;
        let engine_cfg: EngineConfig = serde_json::from_value(json_value["Engine"].clone())?;
        let geomet_cfg: GeometryConfig = serde_json::from_value(json_value["Geometry"].clone())?;
        let launch_cfg: LauncherConfig = serde_json::from_value(json_value["Launcher"].clone())?;
        let para_cfg: ParachuteConfig = serde_json::from_value(json_value["Parachute"].clone())?;
        let payload_cfg: PayloadConfig = serde_json::from_value(json_value["Payload"].clone())?;

        let aero =
            Aerodynamic::new(&aero_cfg, base_dir).context("Failed to initialize Aerodynamic")?;
        let atmos = Atmosphere::new();
        let engine = Engine::new(&engine_cfg, base_dir).context("Failed to initialize Engine")?;
        let geomet = Geometry::new(&geomet_cfg, &engine);
        let launch = Launcher::new(&launch_cfg);
        let wind = Wind::new(&wind_cfg, launch_cfg.mag_dec);
        let para = Parachute::new(&para_cfg);
        let payload = Payload::new(&payload_cfg);

        let solver_val = &json_value["Solver"];
        let name = solver_val["name"].as_str().unwrap_or("Unknown").to_string();
        let dt = solver_val["dt"].as_f64().unwrap_or(0.001);
        let t_max = solver_val["t_max"].as_f64().unwrap_or(1000.0);

        let speed_min = solver_val["speed_min"].as_f64().unwrap_or(0.0);
        let speed_step = solver_val["speed_step"].as_f64().unwrap_or(1.0);
        let speed_num = solver_val["speed_num"].as_i64().unwrap_or(1) as usize;
        let azimuth_min = solver_val["azimuth_min"].as_f64().unwrap_or(0.0);
        let azimuth_num = solver_val["azimuth_num"].as_i64().unwrap_or(1) as usize;

        Ok(Parameter {
            name,
            dt,
            t_max,
            aero,
            atmos,
            wind,
            engine,
            geomet,
            launch,
            para,
            payload,
            speed_min,
            speed_step,
            speed_num,
            azimuth_min,
            azimuth_num,
        })
    }

    fn read_config<P: AsRef<Path>>(path: P) -> anyhow::Result<HashMap<String, String>> {
        let path = path.as_ref();
        let mut config = HashMap::new();

        if path
            .extension()
            .and_then(|s| s.to_str())
            .unwrap_or("")
            .eq_ignore_ascii_case("toml")
        {
            let content = std::fs::read_to_string(path)?;
            let toml_val: toml::Value = toml::from_str(&content)?;
            Self::flatten_toml(&toml_val, &mut config);
            return Ok(config);
        }

        let file = File::open(path)?;
        let reader = BufReader::new(file);

        for line in reader.lines() {
            let line = line?;
            let line = line.trim();

            if line.is_empty() || line.starts_with('$') {
                continue;
            }

            if let Some((name_str, val_str)) = line.split_once(',') {
                let name = name_str.trim().to_string();
                let val = val_str.trim().to_string();
                config.insert(name, val);
            }
        }

        Ok(config)
    }

    fn flatten_toml(val: &toml::Value, config: &mut HashMap<String, String>) {
        if let toml::Value::Table(table) = val {
            for (k, v) in table {
                match v {
                    toml::Value::Table(_) => Self::flatten_toml(v, config),
                    toml::Value::String(s) => {
                        config.insert(k.clone(), s.clone());
                    }
                    toml::Value::Integer(i) => {
                        config.insert(k.clone(), i.to_string());
                    }
                    toml::Value::Float(f) => {
                        config.insert(k.clone(), f.to_string());
                    }
                    toml::Value::Boolean(b) => {
                        config.insert(k.clone(), b.to_string());
                    }
                    _ => {}
                }
            }
        }
    }

    fn parse_bool(val: Option<&String>) -> bool {
        matches!(
            val.map(|s| s.as_str()),
            Some("True") | Some("true") | Some("1")
        )
    }

    fn allocate_df(config_src: &HashMap<String, String>) -> anyhow::Result<serde_json::Value> {
        use serde_json::json;

        // Geometry
        let diam = config_src
            .get("diameter")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0)
            * 1.0e-3;
        let length = config_src
            .get("length")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0)
            * 1.0e-3;
        let mass_dry = config_src
            .get("mass_dry")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let lcg_dry = config_src
            .get("lcg_dry")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0)
            * 1.0e-3;
        let ij_roll_dry = config_src
            .get("Ij_dry_roll")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let ij_pitch_dry = config_src
            .get("Ij_dry_pitch")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);

        let geometry_json = json!({
            "diameter": diam,
            "length": length,
            "mass_dry": mass_dry,
            "lcg_dry": lcg_dry,
            "ij_roll_dry": ij_roll_dry,
            "ij_pitch_dry": ij_pitch_dry
        });

        // Engine
        let mass_ox = config_src
            .get("mass_ox")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let mass_fuel_bef = config_src
            .get("mass_fuel_bef")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let mass_fuel_aft = config_src
            .get("mass_fuel_aft")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let lcg_ox = config_src
            .get("lcg_ox")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0)
            * 1.0e-3;
        let lcg_fuel = config_src
            .get("lcg_fuel")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0)
            * 1.0e-3;
        let l_tank_cap = config_src
            .get("l_tank_cap")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0)
            * 1.0e-3;
        let mut thrust_file = config_src.get("thrust_file").cloned().unwrap_or_default();
        if !thrust_file.is_empty() && !Path::new(&thrust_file).exists() {
            thrust_file = format!("miniQuabla/{}", thrust_file);
        }

        let engine_json = json!({
            "mass_ox": mass_ox,
            "mass_fuel_bef": mass_fuel_bef,
            "mass_fuel_aft": mass_fuel_aft,
            "lcg_ox": lcg_ox,
            "lcg_fuel": lcg_fuel,
            "l_tank_cap": l_tank_cap,
            "thrust_file": thrust_file
        });

        // Aerodynamics
        let lcp = config_src
            .get("lcp")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0)
            * 1.0e-3;
        let ca = config_src
            .get("CA")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let cna = config_src
            .get("CNa")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let clp = config_src
            .get("Clp")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let cmq = config_src
            .get("Cmq")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let exist_lcp_file = Self::parse_bool(config_src.get("exsist_lcp_file"));
        let exist_ca_file = Self::parse_bool(config_src.get("exsist_CA_file"));
        let exist_cna_file = Self::parse_bool(config_src.get("exsist_CNa_file"));
        let mut lcp_file = config_src.get("lcp_file").cloned().unwrap_or_default();
        if !lcp_file.is_empty() && !Path::new(&lcp_file).exists() {
            lcp_file = format!("miniQuabla/{}", lcp_file);
        }
        let mut ca_file = config_src.get("CA_file").cloned().unwrap_or_default();
        if !ca_file.is_empty() && !Path::new(&ca_file).exists() {
            ca_file = format!("miniQuabla/{}", ca_file);
        }
        let mut cna_file = config_src.get("CNa_file").cloned().unwrap_or_default();
        if !cna_file.is_empty() && !Path::new(&cna_file).exists() {
            cna_file = format!("miniQuabla/{}", cna_file);
        }

        let aero_json = json!({
            "lcp": lcp,
            "ca": ca,
            "cna": cna,
            "clp": clp,
            "cmq": cmq,
            "exist_lcp_file": exist_lcp_file,
            "exist_ca_file": exist_ca_file,
            "exist_cna_file": exist_cna_file,
            "lcp_file": lcp_file,
            "ca_file": ca_file,
            "cna_file": cna_file
        });

        // Wind
        let speed = config_src
            .get("wind_speed")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let azimuth = config_src
            .get("wind_azimuth")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let power_coeff = config_src
            .get("wind_power_coeff")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let altitude = config_src
            .get("wind_alt_ref")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let exist_file = Self::parse_bool(config_src.get("exist_wind_file"));
        let mut file = config_src.get("wind_file").cloned().unwrap_or_default();
        if !file.is_empty() && !Path::new(&file).exists() {
            file = format!("miniQuabla/{}", file);
        }

        let wind_json = json!({
            "speed": speed,
            "azimuth": azimuth,
            "power_coeff": power_coeff,
            "altitude": altitude,
            "exist_file": exist_file,
            "file": file
        });

        // Launcher
        let elevation = config_src
            .get("launch_elevation")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let l_azimuth = config_src
            .get("launch_azimuth")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let rail_length = config_src
            .get("rail_length")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let lat = config_src
            .get("lat")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let lon = config_src
            .get("lon")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let height = config_src
            .get("height")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let mag_dec = config_src
            .get("mag_dec")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);

        let launch_json = json!({
            "elevation": elevation,
            "azimuth": l_azimuth,
            "length": rail_length,
            "Latitude": lat,
            "Longtitude": lon,
            "Height": height,
            "mag_dec": mag_dec
        });

        // Parachute
        let vel_para_1st = config_src
            .get("vel_para_1st")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let exist_2nd_para = Self::parse_bool(config_src.get("exist_2nd_para"));
        let second_para_timer = Self::parse_bool(config_src.get("2nd_para_timer"));
        let vel_para_2nd = config_src
            .get("vel_para_2nd")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let alt_para_2nd = config_src
            .get("alt_para_2nd")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let time_2nd = config_src
            .get("time_2nd")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);

        let para_json = json!({
            "vel_para_1st": vel_para_1st,
            "exist_2nd_para": exist_2nd_para,
            "2nd_para_timer": second_para_timer,
            "vel_para_2nd": vel_para_2nd,
            "alt_para_2nd": alt_para_2nd,
            "time_2nd": time_2nd
        });

        // Payload
        let exist_payload = Self::parse_bool(config_src.get("exist_payload"));
        let mass_payload = config_src
            .get("mass_payload")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let vel_payload = config_src
            .get("vel_payload")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);

        let payload_json = json!({
            "exist_payload": exist_payload,
            "mass_payload": mass_payload,
            "vel_payload": vel_payload
        });

        // Solver
        let name = config_src.get("name").cloned().unwrap_or_default();
        let dt = config_src
            .get("dt")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.001);
        let t_max = config_src
            .get("t_max")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(1000.0);
        let speed_min = config_src
            .get("speed_min")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let speed_step = config_src
            .get("speed_step")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(1.0);
        let speed_num = config_src
            .get("speed_num")
            .and_then(|s| s.parse::<i64>().ok())
            .unwrap_or(1);
        let azimuth_min = config_src
            .get("azimuth_min")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        let azimuth_num = config_src
            .get("azimuth_num")
            .and_then(|s| s.parse::<i64>().ok())
            .unwrap_or(1);

        let solver_json = json!({
            "name": name,
            "dt": dt,
            "t_max": t_max,
            "speed_min": speed_min,
            "speed_step": speed_step,
            "speed_num": speed_num,
            "azimuth_min": azimuth_min,
            "azimuth_num": azimuth_num
        });

        let config_dst = json!({
            "Geometry": geometry_json,
            "Aerodynamics": aero_json,
            "Engine": engine_json,
            "Wind": wind_json,
            "Launcher": launch_json,
            "Parachute": para_json,
            "Payload": payload_json,
            "Solver": solver_json
        });

        Ok(config_dst)
    }

    /// Returns: `(pos, vel, quat, omega, mass)`
    pub fn get_initial_param(
        &self,
    ) -> (
        Vector3<f64>,
        Vector3<f64>,
        UnitQuaternion<f64>,
        Vector3<f64>,
        f64,
    ) {
        let vel = Vector3::zeros();
        let omega = Vector3::zeros();

        let elev = self.launch.elevation.to_radians();
        let azim = (self.launch.azimuth + self.launch.mag_dec).to_radians();
        let roll = 0.0;

        let quat = UnitQuaternion::from_euler_angles(roll, elev, azim);
        let dcm = quat.to_rotation_matrix();
        let mass = self.geomet.mass_bef;

        let pos_body = Vector3::new(self.geomet.get_lcg(0.0), 0.0, 0.0);
        let pos = dcm * pos_body;

        (pos, vel, quat, omega, mass)
    }

    /// Returns a tuple of vectors containing combinations of wind speeds and azimuths
    /// for Monte Carlo dispersion calculations.
    pub fn get_wind_array(&self) -> (Vec<f64>, Vec<f64>) {
        let mut speed_array = Vec::with_capacity(self.speed_num);
        for i in 0..self.speed_num {
            speed_array.push(self.speed_min + (i as f64) * self.speed_step);
        }

        let mut azimuth_array = Vec::with_capacity(self.azimuth_num);
        if self.azimuth_num > 0 {
            let azimuth_step = 360.0 / (self.azimuth_num as f64);
            for i in 0..self.azimuth_num {
                azimuth_array.push(self.azimuth_min + (i as f64) * azimuth_step);
            }
        }

        (speed_array, azimuth_array)
    }
}
