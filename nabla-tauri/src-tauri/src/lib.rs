use nabla_core::app::{self, SimulationResult};
use std::path::PathBuf;

#[tauri::command]
fn get_default_config() -> String {
    app::DEFAULT_CONFIG.to_string()
}

#[derive(serde::Deserialize)]
pub struct ExtraFile {
    name: String,
    content: String,
}

#[tauri::command]
async fn run_simulation(
    config_content: String,
    is_loop: bool,
    extra_files: Vec<ExtraFile>,
) -> Result<SimulationResult, String> {
    let extra_files: Vec<app::ExtraFile> = extra_files
        .into_iter()
        .map(|f| app::ExtraFile {
            name: f.name,
            content: f.content.into_bytes(),
        })
        .collect();

    // Depending on where `tauri dev` is executed, the workspace root differs.
    let fallback_dirs = [
        PathBuf::from("../../nabla-cli/config"), // cwd is src-tauri
        PathBuf::from("../nabla-cli/config"),    // cwd is nabla-tauri
        PathBuf::from("nabla-cli/config"),       // cwd is workspace root
    ];

    // The solver is CPU-bound; keep it off the async runtime.
    tauri::async_runtime::spawn_blocking(move || {
        app::run_simulation(&config_content, is_loop, &extra_files, &fallback_dirs)
    })
    .await
    .map_err(|e| e.to_string())?
    .map_err(|e| format!("{:#}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![get_default_config, run_simulation])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
