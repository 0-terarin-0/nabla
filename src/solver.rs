use nalgebra::{DVector, Vector3};

use crate::dynamics::{dynamics_parachute, dynamics_trajectory};
use crate::parachute::Parachute;
use crate::parameter::Parameter;

pub fn solve_trajectory(param: &Parameter) -> (Vec<f64>, Vec<DVector<f64>>) {
    let (pos0, vel0, quat0, omega0, mass0) = param.get_initial_param();

    let mut x = DVector::zeros(14);
    x.fixed_view_mut::<3, 1>(0, 0).copy_from(&pos0);
    x.fixed_view_mut::<3, 1>(3, 0).copy_from(&vel0);

    let q = quat0.quaternion();
    x[6] = q.w;
    x[7] = q.i;
    x[8] = q.j;
    x[9] = q.k;

    x.fixed_view_mut::<3, 1>(10, 0).copy_from(&omega0);
    x[13] = mass0;

    let mut t = 0.0;

    let mut time_log = Vec::new();
    let mut state_log = Vec::new();

    time_log.push(t);
    state_log.push(x.clone());

    while t < param.t_max {
        let dt_current = if t < param.engine.time_act * 1.2 {
            param.dt
        } else {
            param.dt * 5.0
        };

        let k1 = dynamics_trajectory(t, &x, param);
        let k2 = dynamics_trajectory(t + 0.5 * dt_current, &(&x + 0.5 * dt_current * &k1), param);
        let k3 = dynamics_trajectory(t + 0.5 * dt_current, &(&x + 0.5 * dt_current * &k2), param);
        let k4 = dynamics_trajectory(t + dt_current, &(&x + dt_current * &k3), param);

        x = &x + (dt_current / 6.0) * (k1 + 2.0 * k2 + 2.0 * k3 + k4);
        t += dt_current;

        // Normalize quaternion to prevent numerical drift
        let q_norm = (x[6].powi(2) + x[7].powi(2) + x[8].powi(2) + x[9].powi(2)).sqrt();
        if q_norm > 0.0 {
            x[6] /= q_norm;
            x[7] /= q_norm;
            x[8] /= q_norm;
            x[9] /= q_norm;
        }

        time_log.push(t);
        state_log.push(x.clone());

        if x[2] >= 0.0 && t > 1.0 {
            break;
        }
    }

    (time_log, state_log)
}

pub fn solve_parachute(
    param: &Parameter,
    para: &Parachute,
    time0: f64,
    pos0: &Vector3<f64>,
) -> (Vec<f64>, Vec<DVector<f64>>) {
    let mut x = DVector::zeros(3);
    x.fixed_view_mut::<3, 1>(0, 0).copy_from(pos0);

    let dt = param.dt * 10.0;
    let mut t = time0;

    let mut time_log = Vec::new();
    let mut state_log = Vec::new();

    time_log.push(t);
    state_log.push(x.clone());

    while t < param.t_max {
        let k1 = dynamics_parachute(t, &x, param, para);
        let k2 = dynamics_parachute(t + 0.5 * dt, &(&x + 0.5 * dt * &k1), param, para);
        let k3 = dynamics_parachute(t + 0.5 * dt, &(&x + 0.5 * dt * &k2), param, para);
        let k4 = dynamics_parachute(t + dt, &(&x + dt * &k3), param, para);

        x = &x + (dt / 6.0) * (k1 + 2.0 * k2 + 2.0 * k3 + k4);
        t += dt;

        time_log.push(t);
        state_log.push(x.clone());

        if x[2] >= 0.0 {
            break;
        }
    }

    (time_log, state_log)
}
