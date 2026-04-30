use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct PayloadConfig {
    pub exist_payload: bool,
    pub mass_payload: f64,
    pub vel_payload: f64,
}

#[derive(Clone)]
pub struct Payload {
    pub exist: bool,
    pub mass: f64,
    pub vel_descent: f64,
}

impl Payload {
    pub fn new(config: &PayloadConfig) -> Self {
        Payload {
            exist: config.exist_payload,
            mass: config.mass_payload,
            vel_descent: config.vel_payload,
        }
    }

    pub fn get_velocity(&self, _time: f64, _altitude: f64) -> f64 {
        self.vel_descent
    }
}
