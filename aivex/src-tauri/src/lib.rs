use std::process::{Child, Command};
use std::sync::Mutex;
use std::sync::atomic::{AtomicUsize, AtomicU32, AtomicU16, Ordering};
use tauri::{self, Manager, State};
use std::sync::LazyLock;

use base64::Engine;
use screenshots::Screen;
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};

static AUDIO: LazyLock<AudioState> = LazyLock::new(|| AudioState {
    stream_ptr: AtomicUsize::new(0),
    buffer: Mutex::new(Vec::new()),
    rate: AtomicU32::new(48000),
    channels: AtomicU16::new(2),
});

struct AudioState {
    stream_ptr: AtomicUsize,
    buffer: Mutex<Vec<f32>>,
    rate: AtomicU32,
    channels: AtomicU16,
}

struct BackendProcess(Mutex<Option<Child>>);

fn get_backend_path() -> String {
    if cfg!(debug_assertions) {
        "../backend/main.py".into()
    } else {
        "resources/backend/aivex-backend.exe".into()
    }
}

fn start_backend(backend: &State<BackendProcess>) {
    let mut guard = backend.0.lock().unwrap();
    if guard.is_some() { return; }
    let path = get_backend_path();
    let proc = if cfg!(debug_assertions) {
        Command::new("python").arg(&path).spawn().ok()
    } else {
        Command::new(&path).spawn().ok()
    };
    *guard = proc;
}

fn stop_backend(backend: &State<BackendProcess>) {
    let mut guard = backend.0.lock().unwrap();
    if let Some(ref mut child) = *guard { let _ = child.kill(); }
    *guard = None;
}

#[tauri::command] fn minimize(window: tauri::Window) { let _ = window.minimize(); }
#[tauri::command] fn maximize(window: tauri::Window) { if window.is_maximized().unwrap_or(false) { let _ = window.unmaximize(); } else { let _ = window.maximize(); } }
#[tauri::command] fn close(window: tauri::Window) { let _ = window.close(); }
#[tauri::command] fn get_always_on_top(window: tauri::Window) -> bool { window.is_always_on_top().unwrap_or(true) }
#[tauri::command] fn set_always_on_top(window: tauri::Window, value: bool) { let _ = window.set_always_on_top(value); }
#[tauri::command] fn resize_window(window: tauri::Window, width: f64, height: f64) { let _ = window.set_size(tauri::LogicalSize::new(width, height)); let _ = window.center(); }
#[tauri::command] fn reset_window_size(window: tauri::Window) { let _ = window.set_size(tauri::LogicalSize::new(430.0, 760.0)); let _ = window.center(); }

#[tauri::command]
fn get_screen_size() -> serde_json::Value {
    let screens = Screen::all().unwrap_or_default();
    if let Some(s) = screens.first() { let i = s.display_info; serde_json::json!({"width":i.width,"height":i.height}) }
    else { serde_json::json!({"width":1920,"height":1080}) }
}

#[tauri::command]
fn capture_screen() -> Option<String> {
    let screens = Screen::all().ok()?; let s = screens.first()?; let img = s.capture().ok()?;
    let mut buf = Vec::new(); let mut c = std::io::Cursor::new(&mut buf);
    img.write_to(&mut c, screenshots::image::ImageFormat::Jpeg).ok()?;
    Some(format!("data:image/jpeg;base64,{}", base64::engine::general_purpose::STANDARD.encode(&buf)))
}

#[tauri::command]
async fn restart_backend(backend: State<'_, BackendProcess>) -> Result<String, String> {
    stop_backend(&backend); start_backend(&backend); Ok("restarted".into())
}

#[tauri::command]
fn start_audio_capture() -> Result<(), String> {
    let host = cpal::default_host();
    let device = host.default_output_device().ok_or("No output device")?;
    let config = device.default_output_config().map_err(|e| e.to_string())?;
    let cfg: cpal::StreamConfig = config.into();

    AUDIO.rate.store(cfg.sample_rate.0, Ordering::Relaxed);
    AUDIO.channels.store(cfg.channels, Ordering::Relaxed);
    AUDIO.buffer.lock().unwrap().clear();

    let stream = device.build_input_stream(
        &cfg,
        move |data: &[f32], _| { if let Ok(mut b) = AUDIO.buffer.lock() { b.extend_from_slice(data); } },
        move |err| { eprintln!("Audio error: {}", err); },
        None,
    ).map_err(|e| e.to_string())?;

    stream.play().map_err(|e| e.to_string())?;

    let stream_box = Box::new(stream);
    let ptr = Box::into_raw(stream_box) as usize;
    AUDIO.stream_ptr.store(ptr, Ordering::SeqCst);

    Ok(())
}

#[tauri::command]
fn stop_audio_capture() -> Result<String, String> {
    let ptr = AUDIO.stream_ptr.swap(0, Ordering::SeqCst);
    if ptr != 0 {
        unsafe {
            let stream = Box::from_raw(ptr as *mut cpal::Stream);
            drop(stream);
        }
    }

    let rate = AUDIO.rate.load(Ordering::Relaxed);
    let ch = AUDIO.channels.load(Ordering::Relaxed);
    let samples = AUDIO.buffer.lock().unwrap().clone();

    let path = std::env::temp_dir().join("aivex-audio.wav");
    let spec = hound::WavSpec { channels: ch, sample_rate: rate, bits_per_sample: 16, sample_format: hound::SampleFormat::Int };
    let mut w = hound::WavWriter::create(&path, spec).map_err(|e| e.to_string())?;
    for &s in &samples {
        w.write_sample((s.clamp(-1.0, 1.0) * 32767.0) as i16).map_err(|e| e.to_string())?;
    }
    w.finalize().map_err(|e| e.to_string())?;
    let raw = std::fs::read(&path).map_err(|e| e.to_string())?;
    Ok(format!("data:audio/wav;base64,{}", base64::engine::general_purpose::STANDARD.encode(&raw)))
}

#[tauri::command] fn get_version() -> String { "1.1.6".into() }
#[tauri::command] fn get_device_id() -> String { machine_uid::get().unwrap_or_default() }

#[tauri::command]
async fn get_activation_status() -> Result<serde_json::Value, String> {
    let did = get_device_id(); let srv = "https://server-activation-06sn.onrender.com"; let c = reqwest::Client::new();
    let _ = c.post(format!("{}/request-access", srv)).json(&serde_json::json!({"deviceId":did,"appVersion":"1.1.6","platform":std::env::consts::OS,"username":whoami::username()})).send().await;
    c.post(format!("{}/check-access", srv)).json(&serde_json::json!({"deviceId":did})).send().await.map_err(|e|e.to_string())?.json().await.map_err(|e|e.to_string())
}

#[tauri::command]
async fn get_subscription() -> Result<serde_json::Value, String> {
    reqwest::get(format!("https://server-activation-06sn.onrender.com/subscription/by-device/{}", get_device_id())).await.map_err(|e|e.to_string())?.json().await.map_err(|e|e.to_string())
}

#[tauri::command]
async fn create_payment(tier: String) -> Result<serde_json::Value, String> {
    reqwest::Client::new().post("https://server-activation-06sn.onrender.com/payment/create").json(&serde_json::json!({"device_id":get_device_id(),"tier":tier})).send().await.map_err(|e|e.to_string())?.json().await.map_err(|e|e.to_string())
}

#[tauri::command]
fn save_text_file(content: String, name: String) -> Result<serde_json::Value, String> {
    let path = std::env::current_dir().map_err(|e|e.to_string())?.join(&name);
    std::fs::write(&path, &content).map_err(|e|e.to_string())?;
    Ok(serde_json::json!({"saved":true,"path":path.to_string_lossy()}))
}

#[tauri::command] fn open_external(url: String) { let _ = open::that(url); }

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(BackendProcess(Mutex::new(None)))
        .setup(|app| { start_backend(&app.state::<BackendProcess>()); Ok(()) })
        .on_window_event(|window, event| { if let tauri::WindowEvent::Destroyed = event { stop_backend(&window.state::<BackendProcess>()); } })
        .invoke_handler(tauri::generate_handler![
            minimize, maximize, close, get_always_on_top, set_always_on_top,
            resize_window, reset_window_size, get_version, get_device_id,
            get_activation_status, get_subscription, create_payment,
            save_text_file, open_external, get_screen_size, capture_screen,
            restart_backend, start_audio_capture, stop_audio_capture,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
