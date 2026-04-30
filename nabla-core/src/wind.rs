use nalgebra::Vector3;
use serde::Deserialize;
use std::path::Path;

#[derive(Debug, Clone, PartialEq)]
pub enum WindModel {
    Power,
    Original,
}

#[derive(Debug, Clone, Deserialize)]
pub struct WindConfig {
    pub speed: f64,
    pub azimuth: f64,
    pub power_coeff: f64,
    pub altitude: f64,
    pub exist_file: bool,
    #[serde(default)]
    pub file: String,
}

#[derive(Clone)]
pub struct Wind {
    pub speed_ref: f64,
    pub azimuth_ref: f64,
    pub exponent: f64,
    pub altitude_ref: f64,
    pub mag_dec: f64,
    pub model: WindModel,
    alt_array: Vec<f64>,
    speed_array: Vec<f64>,
    azimuth_array: Vec<f64>,
}

impl Wind {
    pub fn new(config: &WindConfig, mag_dec: f64) -> Self {
        let speed_ref = config.speed;
        let azimuth_ref = config.azimuth.to_radians();
        let exponent = config.power_coeff;
        let altitude_ref = config.altitude;
        let exist_file = config.exist_file;
        let mag_dec = -mag_dec.to_radians().abs();

        let model = if !exist_file {
            WindModel::Power
        } else {
            WindModel::Original
        };

        let mut alt_array = Vec::new();
        let mut speed_array = Vec::new();
        let mut azimuth_array = Vec::new();

        match model {
            WindModel::Power => {
                let n = 3000;
                for i in 0..n {
                    let alt = (i as f64) * 30e3 / ((n - 1) as f64);
                    alt_array.push(alt);
                    speed_array.push(Self::power_law(speed_ref, altitude_ref, exponent, alt));
                    azimuth_array.push(azimuth_ref);
                }
            }
            WindModel::Original => {
                let mut loaded_file = false;
                if Path::new(&config.file).exists()
                    && let Ok(mut rdr) = csv::ReaderBuilder::new()
                        .has_headers(true)
                        .from_path(&config.file)
                {
                    for result in rdr.records() {
                        if let Ok(record) = result
                            && record.len() >= 3
                            && let (Ok(alt), Ok(spd), Ok(az)) = (
                                record[0].trim().parse::<f64>(),
                                record[1].trim().parse::<f64>(),
                                record[2].trim().parse::<f64>(),
                            )
                        {
                            alt_array.push(alt);
                            speed_array.push(spd);
                            azimuth_array.push(az.to_radians());
                            loaded_file = true;
                        }
                    }
                }

                if !loaded_file {
                    // Fallback to power law if file not found or failed to load
                    let n = 3000;
                    for i in 0..n {
                        let alt = (i as f64) * 30e3 / ((n - 1) as f64);
                        alt_array.push(alt);
                        speed_array.push(Self::power_law(speed_ref, altitude_ref, exponent, alt));
                        azimuth_array.push(azimuth_ref);
                    }
                }
            }
        }

        Wind {
            speed_ref,
            azimuth_ref,
            exponent,
            altitude_ref,
            mag_dec,
            model,
            alt_array,
            speed_array,
            azimuth_array,
        }
    }

    pub fn set_power_model(&mut self, speed_ref: f64, azimuth_ref: f64) {
        self.model = WindModel::Power;
        self.speed_ref = speed_ref;
        self.azimuth_ref = azimuth_ref.to_radians();

        self.alt_array.clear();
        self.speed_array.clear();
        self.azimuth_array.clear();

        let n = 3000;
        for i in 0..n {
            let alt = (i as f64) * 30e3 / ((n - 1) as f64);
            self.alt_array.push(alt);
            self.speed_array.push(Self::power_law(
                self.speed_ref,
                self.altitude_ref,
                self.exponent,
                alt,
            ));
            self.azimuth_array.push(self.azimuth_ref);
        }
    }

    pub fn get_wind_ned(&self, altitude: f64) -> Vector3<f64> {
        let speed = interpolate(&self.alt_array, &self.speed_array, altitude);
        let azimuth = interpolate(&self.alt_array, &self.azimuth_array, altitude) + self.mag_dec;

        Vector3::new(-speed * azimuth.cos(), -speed * azimuth.sin(), 0.0)
    }

    fn power_law(speed_ref: f64, altitude_ref: f64, exponent: f64, altitude: f64) -> f64 {
        if altitude < 0.0 || altitude_ref == 0.0 {
            0.0
        } else {
            speed_ref * (altitude / altitude_ref).powf(1.0 / exponent)
        }
    }
}

fn interpolate(x: &[f64], y: &[f64], target_x: f64) -> f64 {
    if x.is_empty() {
        return 0.0;
    }
    if target_x <= x[0] {
        return y[0];
    }
    let last_idx = x.len() - 1;
    if target_x >= x[last_idx] {
        return y[last_idx];
    }

    match x.binary_search_by(|val| val.partial_cmp(&target_x).unwrap()) {
        Ok(idx) => y[idx],
        Err(idx) => {
            let x0 = x[idx - 1];
            let x1 = x[idx];
            let y0 = y[idx - 1];
            let y1 = y[idx];
            y0 + (y1 - y0) * (target_x - x0) / (x1 - x0)
        }
    }
}
