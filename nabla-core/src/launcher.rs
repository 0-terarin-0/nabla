use nalgebra::Vector3;
use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct LauncherConfig {
    pub elevation: f64,
    pub azimuth: f64,
    #[serde(rename = "Latitude")]
    pub latitude: f64,
    #[serde(rename = "Longtitude")]
    pub longtitude: f64,
    #[serde(rename = "Height")]
    pub height: f64,
    pub length: f64,
    pub mag_dec: f64,
}

#[derive(Clone)]
pub struct Launcher {
    pub elevation: f64,
    pub azimuth: f64,
    pub llh: Vector3<f64>,
    pub length: f64,
    pub mag_dec: f64,
}

impl Launcher {
    pub fn new(config: &LauncherConfig) -> Self {
        Launcher {
            elevation: config.elevation,
            azimuth: config.azimuth,
            llh: Vector3::new(config.latitude, config.longtitude, config.height),
            length: config.length,
            mag_dec: -config.mag_dec.abs(),
        }
    }
}
