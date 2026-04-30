use std::path::Path;

fn interpolate1d(x: f64, xp: &[f64], yp: &[f64]) -> f64 {
    if xp.is_empty() {
        return 0.0;
    }
    if x <= xp[0] {
        return yp[0];
    }
    if x >= *xp.last().unwrap() {
        return *yp.last().unwrap();
    }
    for i in 0..xp.len() - 1 {
        if x >= xp[i] && x <= xp[i + 1] {
            let t = (x - xp[i]) / (xp[i + 1] - xp[i]);
            return yp[i] + t * (yp[i + 1] - yp[i]);
        }
    }
    0.0
}

#[derive(Debug, serde::Deserialize)]
pub struct AerodynamicConfig {
    pub lcp: f64,
    #[serde(rename = "CA", alias = "ca")]
    pub ca: f64,
    #[serde(rename = "CNa", alias = "cna")]
    pub cna: f64,
    #[serde(rename = "Clp", alias = "clp")]
    pub clp: f64,
    #[serde(rename = "Cmq", alias = "cmq")]
    pub cmq: f64,
    #[serde(rename = "exsist_lcp_file", alias = "exist_lcp_file")]
    pub exist_lcp_file: bool,
    #[serde(rename = "exsist_CA_file", alias = "exist_ca_file")]
    pub exist_ca_file: bool,
    #[serde(rename = "exsist_CNa_file", alias = "exist_cna_file")]
    pub exist_cna_file: bool,
    pub lcp_file: String,
    #[serde(rename = "CA_file", alias = "ca_file")]
    pub ca_file: String,
    #[serde(rename = "CNa_file", alias = "cna_file")]
    pub cna_file: String,
}

#[derive(Clone)]
pub struct Aerodynamic {
    pub lcp_const: f64,
    pub coeff_a_const: f64,
    pub coeff_na_const: f64,
    pub coeff_lp: f64,
    pub coeff_mq: f64,
    pub coeff_nr: f64,

    mach_lcp: Vec<f64>,
    lcp_array: Vec<f64>,

    mach_ca: Vec<f64>,
    ca_array: Vec<f64>,

    mach_cna: Vec<f64>,
    cna_array: Vec<f64>,
}

impl Aerodynamic {
    pub fn new(config: &AerodynamicConfig) -> anyhow::Result<Self> {
        let mut coeff_mq = config.cmq;
        if coeff_mq > 0.0 {
            coeff_mq *= -1.0;
        }
        let coeff_nr = coeff_mq;

        let mach_array_const: Vec<f64> = (0..80).map(|i| i as f64 * 20.0 / 79.0).collect();

        let (mach_lcp, lcp_array) = if config.exist_lcp_file {
            let mut rdr = csv::ReaderBuilder::new()
                .has_headers(true)
                .from_path(Path::new(&config.lcp_file))?;
            let mut machs = Vec::new();
            let mut lcps = Vec::new();
            for result in rdr.records() {
                let record = result?;
                if let (Some(mach_str), Some(value_str)) = (record.get(0), record.get(1)) {
                    machs.push(mach_str.parse::<f64>()?);
                    lcps.push(value_str.parse::<f64>()? * 1.0e-3);
                }
            }
            (machs, lcps)
        } else {
            let lcps = vec![config.lcp; mach_array_const.len()];
            (mach_array_const.clone(), lcps)
        };

        let (mach_ca, ca_array) = if config.exist_ca_file {
            let mut rdr = csv::ReaderBuilder::new()
                .has_headers(true)
                .from_path(Path::new(&config.ca_file))?;
            let mut machs = Vec::new();
            let mut cas = Vec::new();
            for result in rdr.records() {
                let record = result?;
                if let (Some(mach_str), Some(value_str)) = (record.get(0), record.get(1)) {
                    machs.push(mach_str.parse::<f64>()?);
                    cas.push(value_str.parse::<f64>()?);
                }
            }
            (machs, cas)
        } else {
            let cas = vec![config.ca; mach_array_const.len()];
            (mach_array_const.clone(), cas)
        };

        let (mach_cna, cna_array) = if config.exist_cna_file {
            let mut rdr = csv::ReaderBuilder::new()
                .has_headers(true)
                .from_path(Path::new(&config.cna_file))?;
            let mut machs = Vec::new();
            let mut cnas = Vec::new();
            for result in rdr.records() {
                let record = result?;
                if let (Some(mach_str), Some(value_str)) = (record.get(0), record.get(1)) {
                    machs.push(mach_str.parse::<f64>()?);
                    cnas.push(value_str.parse::<f64>()?);
                }
            }
            (machs, cnas)
        } else {
            let cnas = vec![config.cna; mach_array_const.len()];
            (mach_array_const, cnas)
        };

        Ok(Aerodynamic {
            lcp_const: config.lcp,
            coeff_a_const: config.ca,
            coeff_na_const: config.cna,
            coeff_lp: config.clp,
            coeff_mq,
            coeff_nr,
            mach_lcp,
            lcp_array,
            mach_ca,
            ca_array,
            mach_cna,
            cna_array,
        })
    }

    pub fn get_lcp(&self, mach: f64) -> f64 {
        interpolate1d(mach, &self.mach_lcp, &self.lcp_array)
    }

    pub fn get_coeff_a(&self, mach: f64) -> f64 {
        interpolate1d(mach, &self.mach_ca, &self.ca_array)
    }

    pub fn get_coeff_na(&self, mach: f64) -> f64 {
        interpolate1d(mach, &self.mach_cna, &self.cna_array)
    }

    pub fn get_coefficient_force(&self, mach: f64) -> (f64, f64) {
        (self.get_coeff_a(mach), self.get_coeff_na(mach))
    }
}
