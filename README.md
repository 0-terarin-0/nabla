# Nabla Simulator

**Nabla** is a blazing-fast, multi-platform rocket flight simulator. It is a full-scratch Rust port of the Python-based [miniQuabla](https://github.com/hotegg-main/miniQuabla), enhanced with a modern Desktop GUI built using **Tauri, Next.js, and Tailwind CSS**.

By leveraging Rust's performance (with Rayon for multi-threading) and Tauri's native capabilities, Nabla offers instant trajectory calculation, Monte Carlo dispersion analysis, and interactive map visualization right on your desktop.

## 🚀 Features

* **Ultra-Fast Computation**: Calculates full 6DOF trajectories and 3DOF parachute descents in mere milliseconds. Monte Carlo dispersion simulations (dozens of wind conditions) finish in less than a second.
* **Modern GUI**: A beautiful, dark-mode-supported desktop application featuring a built-in TOML configuration editor and drag-and-drop external file uploads.
* **Interactive Flight Map**: Integrates `react-leaflet` to display trajectories, parachute drift, and dispersion polygons directly over Esri Satellite Imagery. Includes heat-map coloring for wind speeds and an interactive legend.
* **Safety Area Overlay**: Visualize your launch site's safety boundaries directly on the map to ensure flights remain within limits.
* **Native Export**: Automatically zips all generated CSV logs and KML files and prompts a native OS save dialog for easy extraction to Google Earth or Excel.

---

## 🛠 Installation & Setup

### Prerequisites
* **Rust**: Ensure the Rust toolchain (`cargo`) is installed.
* **Bun**: The modern JavaScript runtime and package manager (`bun`).

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/0-terarin-0/nabla.git
   cd nabla
   ```

2. Navigate to the GUI directory and install dependencies:
   ```bash
   cd nabla-tauri
   bun install
   ```

3. Run the application in development mode:
   ```bash
   bun run tauri dev
   ```

To build a standalone executable application for your OS (Mac `.app`, Windows `.exe`, etc.):
```bash
bun run tauri build
```

*(Note: The core engine can also be run via CLI using `cargo run -p nabla-cli --release -- [path_to_toml]` from the workspace root).*

---

## ⚙️ Configuration Guide (TOML)

Nabla uses a structured **TOML** file for its configuration. In the GUI, you can edit this directly in the left pane. Below is a guide on how to structure your configuration file and what each section does.

### Example Skeleton

```toml
[Solver]
name = "nabla-gui"
dt = 0.01
t_max = 1000.0

[MonteCarlo]
speed_min = 0.0
speed_step = 1.0
speed_num = 9
azimuth_min = 45.0
azimuth_num = 16

[Launcher]
lat = 34.2852
lon = 135.09059
height = 90.0
mag_dec = 7.4
launch_elevation = 85.0
launch_azimuth = 315.0
rail_length = 5.0

[Wind]
wind_speed = 1.0
wind_azimuth = 0.0
wind_power_coeff = 4.5
wind_alt_ref = 2.0
exist_wind_file = false
wind_file = ""

[Geometry]
diameter = 114.0
length = 1320.0
mass_dry = 6.138
lcg_dry = 780.0
Ij_dry_roll = 0.009
Ij_dry_pitch = 1.042

[Aerodynamics]
lcp = 540.0
CA = 0.41
CNa = 5.436
Clp = -0.0296
Cmq = -2.11
exsist_lcp_file = false
exsist_CA_file = false
exsist_CNa_file = false
lcp_file = ""
CA_file = ""
CNa_file = ""

[Engine]
mass_ox = 0.2739
mass_fuel_bef = 0.38
mass_fuel_aft = 0.352
lcg_ox = 136.5
lcg_fuel = 136.0
l_tank_cap = 273.0
thrust_file = "thrust_example.csv"

[Parachute]
vel_para_1st = 8.80
exist_2nd_para = false
vel_para_2nd = 12.83
2nd_para_timer = false
alt_para_2nd = 300.0
time_2nd = 20.0

[Payload]
exist_payload = false
mass_payload = 1.0
vel_payload = 11.55

[SafetyArea]
coordinates = [
    [34.285604, 135.093313],
    [34.286411, 135.092401],
    [34.287492, 135.089311],
    [34.283611, 135.087193],
    [34.284049, 135.092649]
]
```

### Section Breakdown

* **`[Solver]` & `[MonteCarlo]`**: Defines the simulation time steps and the array of wind speeds/azimuths used when clicking "Run Dispersion".
* **`[Launcher]`**: Geographical location (Latitude/Longitude), elevation, launch angle, and rail length.
* **`[Geometry]` & `[Payload]`**: Physical dimensions and mass properties of the rocket body and payload.
* **`[Aerodynamics]`**: Aerodynamic coefficients. You can provide static numbers or set `exsist_*_file = true` and provide a CSV filename to use Mach-dependent curves.
* **`[Engine]`**: Propellant masses and the `thrust_file` (CSV).
  * *GUI Note*: If you specify `thrust_file = "my_thrust.csv"`, make sure to click **"Add CSVs"** in the External Files section of the GUI and upload `my_thrust.csv`.
* **`[Parachute]`**: Parachute descent velocities, deployment timers, and dual-deployment settings.
* **`[SafetyArea]`**: A list of `[Latitude, Longitude]` pairs. These coordinates will be drawn as a semi-transparent black polygon on the Flight Map, allowing you to easily verify if your dispersed landing points fall within the allowed zone.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.