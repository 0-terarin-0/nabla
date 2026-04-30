use nalgebra::{
    DVector, Matrix3, Matrix4, Quaternion, Rotation3, UnitQuaternion, Vector3, Vector4,
};

use crate::parachute::Parachute;
use crate::parameter::Parameter;

pub fn dynamics_trajectory(time: f64, x: &DVector<f64>, param: &Parameter) -> DVector<f64> {
    let pos = Vector3::new(x[0], x[1], x[2]);
    let vel = Vector3::new(x[3], x[4], x[5]);

    let w = x[6];
    let i = x[7];
    let j = x[8];
    let k = x[9];
    let quat = UnitQuaternion::from_quaternion(Quaternion::new(w, i, j, k));
    let quat_array = [w, i, j, k];

    let omega = Vector3::new(x[10], x[11], x[12]);
    let mass = x[13];

    let dcm = quat.to_rotation_matrix();
    let altitude = (-pos[2]).max(1.0e-3);

    let area_ref = param.geomet.area;
    let length_ref = param.geomet.length;
    let diameter_ref = param.geomet.diameter;
    let mdot = param.engine.get_mass_flow_rate(time);
    let lcg = param.geomet.get_lcg(time);
    let ij = param.geomet.get_ij(time);

    let (g, rho, cs) = param.atmos.get_atmosphere(altitude);
    let wind_ned = param.wind.get_wind_ned(altitude);

    let vel_ned = dcm * vel;
    let vel_air_body = dcm.transpose() * calc_air_speed(&vel_ned, &wind_ned);
    let vel_air_abs = vel_air_body.norm();
    let (alpha, beta) = calc_angle_of_attack(&vel_air_body);
    let mach = calc_mach_number(vel_air_abs, cs);
    let dynamic_pressure = calc_dynamic_pressure(vel_air_abs, rho);

    let (coeff_axial, coeff_normal) = param.aero.get_coefficient_force(mach);
    let coeff_lp = param.aero.coeff_lp;
    let coeff_mq = param.aero.coeff_mq;
    let coeff_nr = param.aero.coeff_nr;

    let lcp = param.aero.get_lcp(mach);

    let thrust = param.engine.get_thrust(time);

    let force_aero = calc_aero_force(
        dynamic_pressure,
        alpha,
        beta,
        coeff_axial,
        coeff_normal,
        area_ref,
    );
    let force_thrust = Vector3::new(thrust, 0.0, 0.0);
    let force_gravity = dcm.transpose() * Vector3::new(0.0, 0.0, mass * g);

    let moment_aero = calc_aero_moment(lcg, lcp, &force_aero);
    let moment_aero_damp = calc_aero_damping_moment(
        dynamic_pressure,
        vel_air_abs,
        &omega,
        coeff_lp,
        coeff_mq,
        coeff_nr,
        area_ref,
        length_ref,
        diameter_ref,
    );
    let moment_gyro = calc_gyro_moment(&omega, &ij);

    let mut acc_body = calc_acceleration(
        &force_aero,
        &force_thrust,
        &force_gravity,
        mass,
        &vel,
        &omega,
    );
    let mut omega_dot = calc_omega_dot(&moment_aero, &moment_aero_damp, &moment_gyro, &ij);
    let mut quat_dot = calc_quat_dot(&omega, &quat_array);

    if !is_launch_clear(time, &pos, &dcm, lcg, param) {
        if acc_body[0] < 0.0 && vel[0] < 0.0 {
            acc_body.fill(0.0);
        } else {
            acc_body[1] = 0.0;
            acc_body[2] = 0.0;
        }

        omega_dot.fill(0.0);
        quat_dot = [0.0, 0.0, 0.0, 0.0];
    }

    let mut dxdt = DVector::zeros(14);
    dxdt.fixed_view_mut::<3, 1>(0, 0).copy_from(&vel_ned);
    dxdt.fixed_view_mut::<3, 1>(3, 0).copy_from(&acc_body);
    dxdt[6] = quat_dot[0];
    dxdt[7] = quat_dot[1];
    dxdt[8] = quat_dot[2];
    dxdt[9] = quat_dot[3];
    dxdt.fixed_view_mut::<3, 1>(10, 0).copy_from(&omega_dot);
    dxdt[13] = mdot;

    dxdt
}

pub fn dynamics_parachute(
    time: f64,
    x: &DVector<f64>,
    param: &Parameter,
    para: &Parachute,
) -> DVector<f64> {
    let pos = Vector3::new(x[0], x[1], x[2]);
    let altitude = pos[2].abs();
    let wind_ned = param.wind.get_wind_ned(altitude);

    let mut vel_ned = Vector3::zeros();
    vel_ned[0] = wind_ned[0];
    vel_ned[1] = wind_ned[1];
    vel_ned[2] = para.get_velocity(time, altitude);

    let mut dxdt = DVector::zeros(3);
    dxdt.fixed_view_mut::<3, 1>(0, 0).copy_from(&vel_ned);

    dxdt
}

pub fn calc_air_speed(vel: &Vector3<f64>, wind: &Vector3<f64>) -> Vector3<f64> {
    vel - wind
}

pub fn calc_angle_of_attack(vel_air: &Vector3<f64>) -> (f64, f64) {
    let norm = vel_air.norm();
    let mut alpha = 0.0;
    let mut beta = 0.0;

    if norm > 0.0 {
        alpha = vel_air[2].atan2(vel_air[0]);
        beta = (vel_air[1] / norm).asin();
    }

    (alpha, beta)
}

pub fn calc_mach_number(vel_air_abs: f64, sound_speed: f64) -> f64 {
    vel_air_abs / sound_speed
}

pub fn calc_dynamic_pressure(vel_air_abs: f64, air_density: f64) -> f64 {
    0.5 * air_density * vel_air_abs.powi(2)
}

pub fn calc_aero_force(
    dynamic_pressure: f64,
    alpha: f64,
    beta: f64,
    coeff_axial: f64,
    coeff_normal: f64,
    area_ref: f64,
) -> Vector3<f64> {
    let mut force = Vector3::zeros();
    force[0] = coeff_axial * 1.0;
    force[1] = coeff_normal * beta;
    force[2] = coeff_normal * alpha;

    force * (-dynamic_pressure * area_ref)
}

pub fn calc_acceleration(
    force_aero: &Vector3<f64>,
    force_thrust: &Vector3<f64>,
    force_gravity: &Vector3<f64>,
    mass: f64,
    vel: &Vector3<f64>,
    omega: &Vector3<f64>,
) -> Vector3<f64> {
    let mut acc = force_aero + force_thrust + force_gravity;
    acc /= mass;
    acc += -omega.cross(vel);

    acc
}

pub fn calc_aero_moment(lcg: f64, lcp: f64, force_aero: &Vector3<f64>) -> Vector3<f64> {
    let arm = Vector3::new(lcp - lcg, 0.0, 0.0);
    arm.cross(force_aero)
}

pub fn calc_aero_damping_moment(
    dynamic_pressure: f64,
    vel_air_abs: f64,
    omega: &Vector3<f64>,
    coeff_lp: f64,
    coeff_mq: f64,
    coeff_nr: f64,
    area: f64,
    length: f64,
    diameter: f64,
) -> Vector3<f64> {
    if vel_air_abs > 0.0 {
        let coeffs = Vector3::new(coeff_lp, coeff_mq, coeff_nr);
        let dims = Vector3::new(
            0.5 * diameter.powi(2),
            0.5 * length.powi(2),
            0.5 * length.powi(2),
        );

        let factor = dynamic_pressure * area / vel_air_abs;

        let mut result = Vector3::zeros();
        result[0] = factor * coeffs[0] * dims[0] * omega[0];
        result[1] = factor * coeffs[1] * dims[1] * omega[1];
        result[2] = factor * coeffs[2] * dims[2] * omega[2];

        result
    } else {
        Vector3::zeros()
    }
}

pub fn calc_gyro_moment(omega: &Vector3<f64>, ij: &Vector3<f64>) -> Vector3<f64> {
    let tensor = Matrix3::new(ij[0], 0.0, 0.0, 0.0, ij[1], 0.0, 0.0, 0.0, ij[2]);

    -omega.cross(&(tensor * omega))
}

pub fn calc_omega_dot(
    moment_aero: &Vector3<f64>,
    moment_aero_damp: &Vector3<f64>,
    moment_gyro: &Vector3<f64>,
    ij: &Vector3<f64>,
) -> Vector3<f64> {
    let sum = moment_aero + moment_aero_damp + moment_gyro;
    Vector3::new(sum[0] / ij[0], sum[1] / ij[1], sum[2] / ij[2])
}

pub fn calc_quat_dot(omega: &Vector3<f64>, quat_array: &[f64; 4]) -> [f64; 4] {
    let p = omega[0];
    let q = omega[1];
    let r = omega[2];

    let tensor = Matrix4::new(0.0, -p, -q, -r, p, 0.0, r, -q, q, -r, 0.0, p, r, q, -p, 0.0);

    let q_vec = Vector4::new(quat_array[0], quat_array[1], quat_array[2], quat_array[3]);
    let dot = 0.5 * tensor * q_vec;

    [dot[0], dot[1], dot[2], dot[3]]
}

pub fn is_launch_clear(
    time: f64,
    pos: &Vector3<f64>,
    dcm: &Rotation3<f64>,
    lcg: f64,
    param: &Parameter,
) -> bool {
    let l_launcher = param.launch.length;
    let time_act = param.engine.time_act;
    let distance = (dcm.transpose() * pos)[0] - lcg;

    !(distance < l_launcher && time < time_act)
}
