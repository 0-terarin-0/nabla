//! nabla: A Rust port of the miniQuabla rocket flight simulator.
//!
//! This library provides the core components for simulating rocket trajectories,
//! including parameters, 6DOF dynamics, and numerical solvers.

pub mod aerodynamic;
pub mod atmosphere;
pub mod dynamics;
pub mod engine;
pub mod geometry;
pub mod launcher;
pub mod parachute;
pub mod parameter;
pub mod payload;
pub mod wind;

/// The `dynamics` module defines the equations of motion for the rocket
/// The `solver` module integrates the dynamics over time to produce
/// a simulated trajectory.
pub mod solver;

/// The `post_process` module handles data export, KML generation, and
/// dispersion analysis outputs.
pub mod post_process;
