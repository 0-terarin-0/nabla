use anyhow::Result;
use csv::Writer;
use nalgebra::{DVector, Matrix3, Vector3};
use std::fs::File;
use std::io::Write;

/// Convert NED (North, East, Down) to LLH (Lat, Lon, Height) relative to a launch point
pub fn ned2llh(launch_llh: &Vector3<f64>, pos_ned: &Vector3<f64>) -> Vector3<f64> {
    let launch_ecef = llh2ecef(launch_llh);
    let dcm_ecef2ned = ecef2ned_matrix(launch_llh);

    // Convert back by using the transposed DCM matrix (since rotation matrix transpose == inverse)
    let point_ecef = dcm_ecef2ned.transpose() * pos_ned + launch_ecef;

    ecef2llh(&point_ecef)
}

fn llh2ecef(llh: &Vector3<f64>) -> Vector3<f64> {
    let lat = llh[0].to_radians();
    let lon = llh[1].to_radians();
    let height = llh[2];

    // WGS84 parameters
    let a: f64 = 6378137.0;
    let f: f64 = 1.0 / 298.257223563;
    let e_square = 2.0 * f - f.powi(2);
    let n = a / (1.0 - e_square * lat.sin().powi(2)).sqrt();

    let x = (n + height) * lat.cos() * lon.cos();
    let y = (n + height) * lat.cos() * lon.sin();
    let z = (n * (1.0 - e_square) + height) * lat.sin();

    Vector3::new(x, y, z)
}

fn ecef2llh(ecef: &Vector3<f64>) -> Vector3<f64> {
    let x = ecef[0];
    let y = ecef[1];
    let z = ecef[2];

    let p = (x.powi(2) + y.powi(2)).sqrt();

    // WGS84 parameters
    let a: f64 = 6378137.0;
    let f: f64 = 1.0 / 298.257223563;
    let b = a * (1.0 - f);
    let e_square = 2.0 * f - f.powi(2);
    let edash_square = e_square * (a.powi(2) / b.powi(2));
    let theta = (z * a).atan2(p * b);

    let lat =
        (z + edash_square * b * theta.sin().powi(3)).atan2(p - e_square * a * theta.cos().powi(3));
    let lon = y.atan2(x);
    let n = a / (1.0 - e_square * lat.sin().powi(2)).sqrt();
    let height = p / lat.cos() - n;

    Vector3::new(lat.to_degrees(), lon.to_degrees(), height)
}

fn ecef2ned_matrix(launch_llh: &Vector3<f64>) -> Matrix3<f64> {
    let lat = launch_llh[0].to_radians();
    let lon = launch_llh[1].to_radians();

    Matrix3::new(
        -lon.cos() * lat.sin(),
        -lon.sin() * lat.sin(),
        lat.cos(),
        -lon.sin(),
        lon.cos(),
        0.0,
        -lon.cos() * lat.cos(),
        -lon.sin() * lat.cos(),
        -lat.sin(),
    )
}

/// Export the trajectory data to a KML file
pub fn export_kml(
    path: &str,
    exist_payload: bool,
    launch_llh: &Vector3<f64>,
    pos_hard: &[Vector3<f64>],
    pos_soft: &[Vector3<f64>],
    pos_payload: Option<&[Vector3<f64>]>,
) -> Result<()> {
    let mut file = File::create(path)?;

    writeln!(file, r#"<?xml version="1.0" encoding="UTF-8"?>"#)?;
    writeln!(file, r#"<kml xmlns="http://www.opengis.net/kml/2.2">"#)?;
    writeln!(file, "  <Document>")?;
    writeln!(file, "    <name>Flight Log</name>")?;

    write_kml_linestring(&mut file, launch_llh, pos_hard, "Trajectory", "ff00aaff")?; // Orange
    write_kml_linestring(&mut file, launch_llh, pos_soft, "Parachute", "ffffff00")?; // Aqua

    if exist_payload && let Some(payload) = pos_payload {
        write_kml_linestring(&mut file, launch_llh, payload, "Payload", "ff3c14dc")?; // Crimson
    }

    writeln!(file, "  </Document>")?;
    writeln!(file, "</kml>")?;

    Ok(())
}

fn write_kml_linestring(
    file: &mut File,
    launch_llh: &Vector3<f64>,
    positions: &[Vector3<f64>],
    name: &str,
    color: &str,
) -> Result<()> {
    writeln!(file, "    <Placemark>")?;
    writeln!(file, "      <name>{}</name>", name)?;
    writeln!(file, "      <Style>")?;
    writeln!(file, "        <LineStyle>")?;
    writeln!(file, "          <color>{}</color>", color)?;
    writeln!(file, "          <width>5</width>")?;
    writeln!(file, "        </LineStyle>")?;
    writeln!(file, "      </Style>")?;
    writeln!(file, "      <LineString>")?;
    writeln!(file, "        <extrude>1</extrude>")?;
    writeln!(file, "        <altitudeMode>absolute</altitudeMode>")?;
    writeln!(file, "        <coordinates>")?;

    // Down-sample by 10
    let coords: Vec<String> = positions
        .iter()
        .step_by(10)
        .map(|ned| {
            let llh = ned2llh(launch_llh, ned);
            // KML format expects: lon,lat,alt
            format!("{},{},{}", llh[1], llh[0], llh[2])
        })
        .collect();

    writeln!(file, "          {}", coords.join(" "))?;

    writeln!(file, "        </coordinates>")?;
    writeln!(file, "      </LineString>")?;
    writeln!(file, "    </Placemark>")?;

    Ok(())
}

pub fn export_loop_kml(
    path: &str,
    llh: &nalgebra::Vector3<f64>,
    pos_matrix: &[Vec<nalgebra::Vector3<f64>>],
    speeds: &[f64],
    color: &str,
) -> anyhow::Result<()> {
    use std::io::Write;
    let mut file = std::fs::File::create(path).unwrap();
    writeln!(file, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>").unwrap();
    writeln!(file, "<kml xmlns=\"http://www.opengis.net/kml/2.2\">").unwrap();
    writeln!(file, "  <Document>").unwrap();

    let is_para = color.to_lowercase().contains("ffffff00") || path.contains("parachute");
    let name_prefix = if is_para { "Parachute" } else { "Trajectory" };

    for (i, speed) in speeds.iter().enumerate() {
        if i >= pos_matrix.len() {
            break;
        }

        let fraction = if speeds.len() > 1 {
            i as f64 / (speeds.len() - 1) as f64
        } else {
            0.0
        };

        let (r, g, b) = if is_para {
            // Warm colors for Parachute: Yellow (low) -> Red (high)
            (255, (255.0 * (1.0 - fraction)) as u8, 0)
        } else {
            // Cold colors for Trajectory: Cyan (low) -> Blue (high)
            (0, (255.0 * (1.0 - fraction)) as u8, 255)
        };

        // KML format is AABBGGRR
        let line_color = format!("ff{:02x}{:02x}{:02x}", b, g, r);

        writeln!(file, "    <Placemark>").unwrap();
        writeln!(
            file,
            "      <name>{} - Wind {:.1} m/s</name>",
            name_prefix, speed
        )
        .unwrap();
        writeln!(
            file,
            "      <description>Phase: {}, Wind Speed: {:.1} m/s</description>",
            name_prefix, speed
        )
        .unwrap();
        writeln!(file, "      <Style>").unwrap();
        writeln!(
            file,
            "        <LineStyle><color>{}</color><width>2</width></LineStyle>",
            line_color
        )
        .unwrap();
        writeln!(file, "        <PolyStyle><fill>0</fill></PolyStyle>").unwrap();
        writeln!(file, "      </Style>").unwrap();
        writeln!(file, "      <Polygon>").unwrap();
        writeln!(file, "        <outerBoundaryIs>").unwrap();
        writeln!(file, "          <LinearRing>").unwrap();
        writeln!(file, "            <coordinates>").unwrap();

        for pt in &pos_matrix[i] {
            let lla = ned2llh(llh, pt);
            writeln!(file, "              {},{},{}", lla[1], lla[0], lla[2]).unwrap();
        }

        if let Some(pt) = pos_matrix[i].first() {
            let lla = ned2llh(llh, pt);
            writeln!(file, "              {},{},{}", lla[1], lla[0], lla[2]).unwrap();
        }

        writeln!(file, "            </coordinates>").unwrap();
        writeln!(file, "          </LinearRing>").unwrap();
        writeln!(file, "        </outerBoundaryIs>").unwrap();
        writeln!(file, "      </Polygon>").unwrap();
        writeln!(file, "    </Placemark>").unwrap();
    }

    writeln!(file, "  </Document>").unwrap();
    writeln!(file, "</kml>").unwrap();
    Ok(())
}

#[allow(dead_code)]
pub fn export_loop_kml_old(
    path: &str,
    launch_llh: &Vector3<f64>,
    pos_matrix: &[Vec<Vector3<f64>>],
    speeds: &[f64],
    color: &str,
) -> Result<()> {
    let mut file = File::create(path)?;

    writeln!(file, r#"<?xml version="1.0" encoding="UTF-8"?>"#)?;
    writeln!(file, r#"<kml xmlns="http://www.opengis.net/kml/2.2">"#)?;
    writeln!(file, "  <Document>")?;
    writeln!(file, "    <name>Land Map</name>")?;

    for (i, speed) in speeds.iter().enumerate() {
        let name = format!("{}m/s", speed);
        writeln!(file, "    <Placemark>")?;
        writeln!(file, "      <name>{}</name>", name)?;
        writeln!(file, "      <Style>")?;
        writeln!(file, "        <LineStyle>")?;
        writeln!(file, "          <color>{}</color>", color)?;
        writeln!(file, "          <width>4</width>")?;
        writeln!(file, "        </LineStyle>")?;
        writeln!(file, "      </Style>")?;
        writeln!(file, "      <LineString>")?;
        writeln!(
            file,
            "        <altitudeMode>relativeToGround</altitudeMode>"
        )?;
        writeln!(file, "        <coordinates>")?;

        let mut coords = Vec::new();
        for ned in &pos_matrix[i] {
            let llh = ned2llh(launch_llh, ned);
            coords.push(format!("{},{},{}", llh[1], llh[0], llh[2]));
        }
        if let Some(ned) = pos_matrix[i].first() {
            let llh = ned2llh(launch_llh, ned);
            coords.push(format!("{},{},{}", llh[1], llh[0], llh[2]));
        }

        writeln!(file, "          {}", coords.join(" "))?;
        writeln!(file, "        </coordinates>")?;
        writeln!(file, "      </LineString>")?;
        writeln!(file, "    </Placemark>")?;
    }

    writeln!(file, "  </Document>")?;
    writeln!(file, "</kml>")?;

    Ok(())
}

/// Export time history and state vectors to a CSV file
pub fn export_csv(path: &str, time_log: &[f64], state_log: &[DVector<f64>]) -> Result<()> {
    let mut wtr = Writer::from_path(path)?;

    // Standard headers for export
    wtr.write_record([
        "Time", "North", "East", "Down", "VelX", "VelY", "VelZ", "QuatW", "QuatX", "QuatY",
        "QuatZ", "Mass",
    ])?;

    for (t, state) in time_log.iter().zip(state_log.iter()) {
        // Use get() with unwrap_or(0.0) defensively for potentially smaller state vectors
        let n = state.get(0).copied().unwrap_or(0.0);
        let e = state.get(1).copied().unwrap_or(0.0);
        let d = state.get(2).copied().unwrap_or(0.0);
        let vx = state.get(3).copied().unwrap_or(0.0);
        let vy = state.get(4).copied().unwrap_or(0.0);
        let vz = state.get(5).copied().unwrap_or(0.0);
        let qw = state.get(6).copied().unwrap_or(0.0);
        let qx = state.get(7).copied().unwrap_or(0.0);
        let qy = state.get(8).copied().unwrap_or(0.0);
        let qz = state.get(9).copied().unwrap_or(0.0);
        let mass = state.get(13).copied().unwrap_or(0.0);

        wtr.write_record(&[
            t.to_string(),
            n.to_string(),
            e.to_string(),
            d.to_string(),
            vx.to_string(),
            vy.to_string(),
            vz.to_string(),
            qw.to_string(),
            qx.to_string(),
            qy.to_string(),
            qz.to_string(),
            mass.to_string(),
        ])?;
    }

    wtr.flush()?;
    Ok(())
}
