use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.set_title("NOVA Doc Editor")?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_app_version,
            get_file_from_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running NOVA Doc Editor");
}

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
async fn get_file_from_path(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(&path).map_err(|e| format!("Failed to read file: {}", e))
}
