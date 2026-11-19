use axum::{
    Json, Router,
    extract::{DefaultBodyLimit, Multipart},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post},
};
use nabla_core::app::{self, ExtraFile, SimulationResult};
use serde::Serialize;
use std::net::SocketAddr;
use std::path::PathBuf;
use tower_http::cors::CorsLayer;

#[derive(Serialize)]
struct DefaultConfigResponse {
    config: String,
}

// Custom error type that implements IntoResponse
struct AppError(String);

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        (StatusCode::INTERNAL_SERVER_ERROR, self.0).into_response()
    }
}

impl<E> From<E> for AppError
where
    E: std::fmt::Display,
{
    fn from(err: E) -> Self {
        AppError(err.to_string())
    }
}

#[tokio::main]
async fn main() {
    // Use the most permissive CORS setup to ensure Axum never blocks requests.
    // Cloudflare fake-CORS errors are often due to 413/502 responses missing CORS headers,
    // so we make sure the layer is absolutely permissive.
    let cors = CorsLayer::permissive();

    let app = Router::new()
        .route("/health", get(|| async { "OK" }))
        .route("/api/config/default", get(get_default_config))
        .route("/api/simulate", post(run_simulation))
        // Increase payload size limit to 50MB to accommodate large CSV/Config files if necessary
        .layer(DefaultBodyLimit::max(50 * 1024 * 1024))
        .layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3001));
    println!("Nabla Server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn get_default_config() -> Json<DefaultConfigResponse> {
    Json(DefaultConfigResponse {
        config: app::DEFAULT_CONFIG.to_string(),
    })
}

async fn run_simulation(mut multipart: Multipart) -> Result<Json<SimulationResult>, AppError> {
    println!(">>> Incoming request to /api/simulate");
    let mut config_content = String::new();
    let mut is_loop = false;
    let mut extra_files = Vec::new();

    // Parse the multipart payload.
    // Extra files are sent as `extraFiles` fields; the file name is the path
    // relative to the config file (e.g. `config/thrust.csv`).
    while let Some(field) = multipart.next_field().await? {
        let name = field.name().unwrap_or("").to_string();
        println!(">>> Received multipart field: {}", name);

        match name.as_str() {
            "configContent" => config_content = field.text().await?,
            "isLoop" => is_loop = field.text().await? == "true",
            "extraFiles" => {
                if let Some(filename) = field.file_name().map(str::to_string) {
                    extra_files.push(ExtraFile {
                        name: filename,
                        content: field.bytes().await?.to_vec(),
                    });
                }
            }
            _ => {}
        }
    }

    if config_content.is_empty() {
        println!(">>> Error: Missing configuration content");
        return Err(AppError("Missing configuration content".to_string()));
    }

    println!(
        ">>> Configuration parsed successfully ({} bytes). Executing simulation...",
        config_content.len()
    );

    // Default input files (thrust/wind CSVs) used when the user did not upload them.
    let fallback_dirs = [
        PathBuf::from("../nabla-cli/config"),
        PathBuf::from("nabla-cli/config"),
        PathBuf::from("./config"),
    ];

    // The solver is CPU-bound; keep it off the async runtime.
    let result = tokio::task::spawn_blocking(move || {
        app::run_simulation(&config_content, is_loop, &extra_files, &fallback_dirs)
    })
    .await?
    .map_err(|e| AppError(format!("{:#}", e)))?;

    println!(">>> Simulation complete. Returning results to client.");
    Ok(Json(result))
}
