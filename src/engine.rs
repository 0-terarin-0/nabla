use serde::Deserialize;
use std::path::Path;

#[derive(Debug, Deserialize)]
pub struct EngineConfig {
    pub mass_ox: f64,
    pub mass_fuel_bef: f64,
    pub mass_fuel_aft: f64,
    pub lcg_ox: f64,
    pub lcg_fuel: f64,
    pub l_tank_cap: f64,
    pub thrust_file: String,
}

#[derive(Clone)]
pub struct Engine {
    pub mass_ox: f64,
    pub mass_fuel_bef: f64,
    pub mass_fuel_aft: f64,
    pub lcg_ox: f64,
    pub lcg_fuel: f64,
    pub l_fuel: f64,
    pub delta_fuel: f64,
    pub l_tank: f64,
    pub time_act: f64,
    time_array: Vec<f64>,
    thrust_array: Vec<f64>,
    mdot_prop_log: Vec<f64>,
}

impl Engine {
    pub fn new(config: &EngineConfig) -> anyhow::Result<Self> {
        let delta_fuel = config.mass_fuel_bef - config.mass_fuel_aft;
        let l_tank = 2.0 * (config.l_tank_cap - config.lcg_ox).abs();

        let mut rdr = csv::ReaderBuilder::new()
            .has_headers(true)
            .from_path(Path::new(&config.thrust_file))?;

        let mut time_array = Vec::new();
        let mut thrust_array = Vec::new();

        for result in rdr.records() {
            let record = result?;
            if let (Some(time_str), Some(thrust_str)) = (record.get(0), record.get(1)) {
                time_array.push(time_str.parse::<f64>()?);
                thrust_array.push(thrust_str.parse::<f64>()?);
            }
        }

        let time_act = *time_array.last().unwrap_or(&0.0);

        let total_impulse = Self::get_total_impulse(&time_array, &thrust_array);
        let thrust_ave = total_impulse / time_act;
        let mdot_prop_ave = -(delta_fuel + config.mass_ox) / time_act;

        let mdot_prop_log: Vec<f64> = thrust_array
            .iter()
            .map(|&thrust| {
                if thrust_ave != 0.0 {
                    mdot_prop_ave * (thrust / thrust_ave)
                } else {
                    0.0
                }
            })
            .collect();

        Ok(Self {
            mass_ox: config.mass_ox,
            mass_fuel_bef: config.mass_fuel_bef,
            mass_fuel_aft: config.mass_fuel_aft,
            lcg_ox: config.lcg_ox,
            lcg_fuel: config.lcg_fuel,
            l_fuel: config.l_tank_cap,
            delta_fuel,
            l_tank,
            time_act,
            time_array,
            thrust_array,
            mdot_prop_log,
        })
    }

    pub fn get_thrust(&self, time: f64) -> f64 {
        interpolate1d(time, &self.time_array, &self.thrust_array, 0.0, 0.0)
    }

    pub fn get_mass_flow_rate(&self, time: f64) -> f64 {
        interpolate1d(time, &self.time_array, &self.mdot_prop_log, 0.0, 0.0)
    }

    fn get_total_impulse(time: &[f64], thrust: &[f64]) -> f64 {
        if time.len() != thrust.len() || time.len() < 2 {
            return 0.0;
        }

        let mut sum = 0.0;
        for i in 0..time.len() - 1 {
            let dt = time[i + 1] - time[i];
            let avg_thrust = (thrust[i] + thrust[i + 1]) / 2.0;
            sum += avg_thrust * dt;
        }
        sum
    }
}

pub fn interpolate1d(x: f64, xp: &[f64], yp: &[f64], fill_left: f64, fill_right: f64) -> f64 {
    if xp.is_empty() {
        return fill_left;
    }

    if x <= xp[0] {
        return fill_left;
    }
    if x >= *xp.last().unwrap() {
        return fill_right;
    }

    let idx = xp.partition_point(|&v| v < x);
    if idx == 0 {
        return fill_left;
    }
    if idx >= xp.len() {
        return fill_right;
    }

    let x0 = xp[idx - 1];
    let x1 = xp[idx];
    let y0 = yp[idx - 1];
    let y1 = yp[idx];

    y0 + (x - x0) * (y1 - y0) / (x1 - x0)
}
