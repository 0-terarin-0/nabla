use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct ParachuteConfig {
    pub vel_para_1st: f64,
    pub exist_2nd_para: bool,
    #[serde(default, rename = "2nd_para_timer")]
    pub second_para_timer: bool,
    #[serde(default)]
    pub vel_para_2nd: f64,
    #[serde(default)]
    pub time_2nd: f64,
    #[serde(default)]
    pub alt_para_2nd: f64,
}

#[derive(Clone)]
pub struct Parachute {
    pub vel_para_1st: f64,
    pub exist_2nd_para: bool,
    pub mode_timer_2nd: bool,
    pub vel_para_2nd: f64,
    pub alt_para_2nd: f64,
    pub time_2nd: f64,
}

impl Parachute {
    pub fn new(config: &ParachuteConfig) -> Self {
        let vel_para_1st = config.vel_para_1st;
        let exist_2nd_para = config.exist_2nd_para;

        let (mode_timer_2nd, vel_para_2nd, alt_para_2nd, time_2nd) = if exist_2nd_para {
            let mode = config.second_para_timer;
            let vel = config.vel_para_2nd;
            if mode {
                (mode, vel, 0.0, config.time_2nd)
            } else {
                (mode, vel, config.alt_para_2nd, 1.0e10)
            }
        } else {
            (false, 0.0, 0.0, 0.0)
        };

        Parachute {
            vel_para_1st,
            exist_2nd_para,
            mode_timer_2nd,
            vel_para_2nd,
            alt_para_2nd,
            time_2nd,
        }
    }

    /// 降下速度の取得 (Get descent velocity)
    pub fn get_velocity(&self, time: f64, altitude: f64) -> f64 {
        if self.exist_2nd_para
            && ((self.mode_timer_2nd && time >= self.time_2nd)
                || (!self.mode_timer_2nd && altitude <= self.alt_para_2nd))
        {
            self.vel_para_2nd
        } else {
            self.vel_para_1st
        }
    }
}
