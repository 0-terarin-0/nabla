#[derive(Clone)]
pub struct Atmosphere;

impl Default for Atmosphere {
    fn default() -> Self {
        Self::new()
    }
}

impl Atmosphere {
    pub fn new() -> Self {
        Atmosphere
    }

    /// Computes and returns the atmospheric properties: `(gravity, air_density, sound_speed)`
    pub fn get_atmosphere(&self, altitude: f64) -> (f64, f64, f64) {
        let (_, _, rho, cs) = Self::compute_ussa1976(altitude);
        let gravity = 9.80665;
        (gravity, rho, cs)
    }

    /// Returns `(pressure, temperature, density, sound_speed)` using the 1976 US Standard Atmosphere.
    pub fn compute_ussa1976(altitude: f64) -> (f64, f64, f64, f64) {
        let re = 6378137.0; // Earth Radius [m]
        let altitude = altitude * re / (re + altitude); // geometric altitude => geopotential height

        // Clamp the altitude to match the Python script's fill_value behavior
        // (returning end values when out of bounds of the table)
        let altitude = altitude.clamp(0.0, 84852.0);

        let g0 = 9.80665;
        let r = 287.0528;
        let gamma = 1.4;

        let h_b: [f64; 7] = [0.0, 11000.0, 20000.0, 32000.0, 47000.0, 51000.0, 71000.0];
        let t_b: [f64; 7] = [288.15, 216.65, 216.65, 228.65, 270.65, 270.65, 214.65];
        let l_b: [f64; 7] = [-0.0065, 0.0, 0.001, 0.0028, 0.0, -0.0028, -0.002];
        let p_b: [f64; 7] = [
            101325.0, 22632.06, 5474.88, 868.018, 110.906, 66.9388, 3.95642,
        ];

        let mut b = 0;
        for i in 0..6 {
            if altitude < h_b[i + 1] {
                b = i;
                break;
            } else {
                b = 6; // Set for highest altitude range if we exceed the 6th layer
            }
        }

        let hb = h_b[b];
        let tb = t_b[b];
        let lb = l_b[b];
        let pb = p_b[b];

        let t = tb + lb * (altitude - hb);

        let p = if lb == 0.0 {
            pb * (-g0 * (altitude - hb) / (r * tb)).exp()
        } else {
            pb * (tb / t).powf(g0 / (r * lb))
        };

        let rho = p / (r * t);
        let cs = (gamma * r * t).sqrt();

        (p, t, rho, cs)
    }
}
