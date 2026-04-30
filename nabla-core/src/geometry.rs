use nalgebra::Vector3;
use serde::Deserialize;
use std::f64::consts::PI;

use crate::engine::Engine;

#[derive(Debug, Clone, Deserialize)]
pub struct GeometryConfig {
    pub diameter: f64,
    pub length: f64,
    pub mass_dry: f64,
    pub lcg_dry: f64,
    #[serde(rename = "Ij_roll_dry", alias = "ij_roll_dry")]
    pub ij_roll_dry: f64,
    #[serde(rename = "Ij_pitch_dry", alias = "ij_pitch_dry")]
    pub ij_pitch_dry: f64,
}

#[derive(Clone)]
pub struct Geometry {
    pub diameter: f64,
    pub length: f64,
    pub area: f64,
    pub mass_bef: f64,
    pub mass_inert: f64,
    pub lcg_inert: f64,

    time_list: Vec<f64>,
    lcg_array: Vec<f64>,
    ij_pitch_array: Vec<f64>,
    ij_roll_array: Vec<f64>,
}

impl Geometry {
    pub fn new(config: &GeometryConfig, engine: &Engine) -> Self {
        let diameter = config.diameter;
        let length = config.length;
        let area = 0.25 * PI * diameter.powi(2);

        let time_sta = 0.0;
        let time_list = vec![time_sta, engine.time_act];

        let mass_dry = config.mass_dry;
        let mass_bef = mass_dry + engine.mass_ox;
        let mass_inert = mass_dry - engine.delta_fuel;

        let lcg_dry = config.lcg_dry;
        let mut lcg_bef = mass_dry * lcg_dry + engine.mass_ox * engine.lcg_ox;
        lcg_bef /= mass_dry + engine.mass_ox;

        let mut lcg_aft = mass_dry * lcg_dry - engine.delta_fuel * engine.lcg_fuel;
        lcg_aft /= mass_dry - engine.delta_fuel;

        let mut lcg_inert = mass_dry * lcg_dry - engine.delta_fuel * engine.lcg_fuel;
        lcg_inert /= mass_dry - engine.delta_fuel;

        let lcg_array = vec![lcg_bef, lcg_aft];

        let ij_roll_dry = config.ij_roll_dry;
        let ij_pitch_dry = config.ij_pitch_dry;

        let ij_pitch_ox = engine.mass_ox
            * (diameter.powi(2) / 16.0
                + engine.l_tank.powi(2) / 12.0
                + (engine.lcg_ox - lcg_bef).powi(2));
        let ij_pitch_fuel = engine.delta_fuel
            * (diameter.powi(2) / 16.0
                + engine.l_fuel.powi(2) / 12.0
                + (engine.lcg_fuel - lcg_aft).powi(2));

        let ij_pitch_dry_bef = ij_pitch_dry + mass_dry * (lcg_bef - lcg_dry).abs().powi(2);
        let ij_pitch_dry_aft = ij_pitch_dry;

        let ij_pitch_bef = ij_pitch_dry_bef + ij_pitch_ox;
        let ij_pitch_aft = ij_pitch_dry_aft - ij_pitch_fuel;

        let ij_pitch_array = vec![ij_pitch_bef, ij_pitch_aft];

        let ij_roll_bef = ij_roll_dry;
        let ij_roll_aft = ij_roll_dry;
        let ij_roll_array = vec![ij_roll_bef, ij_roll_aft];

        Self {
            diameter,
            length,
            area,
            mass_bef,
            mass_inert,
            lcg_inert,
            time_list,
            lcg_array,
            ij_pitch_array,
            ij_roll_array,
        }
    }

    pub fn get_lcg(&self, time: f64) -> f64 {
        interpolate1d(time, &self.time_list, &self.lcg_array)
    }

    pub fn get_ij(&self, time: f64) -> Vector3<f64> {
        let ij_pitch = interpolate1d(time, &self.time_list, &self.ij_pitch_array);
        let ij_roll = interpolate1d(time, &self.time_list, &self.ij_roll_array);

        Vector3::new(ij_roll, ij_pitch, ij_pitch)
    }
}

fn interpolate1d(x: f64, xp: &[f64], yp: &[f64]) -> f64 {
    if xp.is_empty() {
        return 0.0;
    }
    if x <= xp[0] {
        return yp[0];
    }
    let n = xp.len();
    if x >= xp[n - 1] {
        return yp[n - 1];
    }
    for i in 0..n - 1 {
        if x >= xp[i] && x <= xp[i + 1] {
            let dx = xp[i + 1] - xp[i];
            if dx == 0.0 {
                return yp[i];
            }
            let t = (x - xp[i]) / dx;
            return yp[i] + t * (yp[i + 1] - yp[i]);
        }
    }
    yp[n - 1]
}
