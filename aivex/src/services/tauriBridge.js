import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export async function initTauriBridge() {
  if (!window.__TAURI_INTERNALS__) return;

  window.aivexWindow = {
    minimize: () => invoke("minimize"),
    maximize: () => invoke("maximize"),
    close: () => invoke("close"),

    getVersion: () => invoke("get_version"),
    getDeviceId: () => invoke("get_device_id"),
    getActivationStatus: () => invoke("get_activation_status"),
    getSubscription: () => invoke("get_subscription"),
    createPayment: (tier) => invoke("create_payment", { tier }),

    getAlwaysOnTop: () => invoke("get_always_on_top"),
    setAlwaysOnTop: (value) => invoke("set_always_on_top", { value }),

    resizeWindow: (width, height) =>
      invoke("resize_window", { width, height }),
    resetWindowSize: () => invoke("reset_window_size"),
    getScreenSize: () => invoke("get_screen_size"),

    captureScreen: () => invoke("capture_screen"),

    saveTextFile: (content, name) =>
      invoke("save_text_file", { content, name }),
    openExternal: (url) => invoke("open_external", { url }),
    openFile: (path) => invoke("open_external", { url: path }),

    createPayment: (tier) => invoke("create_payment", { tier }),
    downloadUpdate: async () => {
      try {
        const { check } = await import("@tauri-apps/plugin-updater");
        const update = await check();
        if (update) {
          await update.downloadAndInstall();
        }
      } catch {}
    },
    installUpdate: async () => {
      try {
        const { check } = await import("@tauri-apps/plugin-updater");
        const update = await check();
        if (update) {
          await update.install();
        }
      } catch {}
    },
    onUpdateAvailable: (cb) => listen("update-available", cb),
    onUpdateProgress: (cb) => listen("update-progress", ({ payload }) => cb(payload)),
    onUpdateDownloaded: (cb) => listen("update-downloaded", cb),

    getClipboardText: async () => {
      try {
        const { readText } = await import("@tauri-apps/plugin-clipboard-manager");
        return await readText();
      } catch {
        return "";
      }
    },
    getClipboardImage: async () => {
      try {
        const { readImageBase64 } = await import("@tauri-apps/plugin-clipboard-manager");
        return await readImageBase64();
      } catch {
        return null;
      }
    },

    restartBackend: () => invoke("restart_backend"),
    importJSON: () => invoke("import_json"),

    startAudioCapture: () => invoke("start_audio_capture"),
    stopAudioCapture: () => invoke("stop_audio_capture"),
    onBackendRestart: (cb) => listen("backend-restarting", ({ payload }) => cb(null, payload)),

    onBeforeMinimize: (cb) => {
      const handler = () => cb();
      window.addEventListener("tauri://blur", handler);
      return () => window.removeEventListener("tauri://blur", handler);
    },
    onRestore: (cb) => {
      listen("window-restored", cb);
      return () => {};
    },
    onScreenPeekToggle: (cb) => listen("screenpeek-toggle", cb),

    completeMinimize: () => {},
  };
}
