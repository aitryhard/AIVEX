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
    getSubscription: () => invoke("get_subscription"),
    createPayment: (tier) => invoke("create_payment", { tier }),

    getAlwaysOnTop: () => invoke("get_always_on_top"),
    setAlwaysOnTop: (v) => invoke("set_always_on_top", { value: v }),

    resizeWindow: (w, h) => invoke("resize_window", { width: w, height: h }),
    resetWindowSize: () => invoke("reset_window_size"),

    saveTextFile: (c, n) => invoke("save_text_file", { content: c, name: n }),
    openExternal: (url) => invoke("open_external", { url }),
    openFile: (p) => invoke("open_external", { url: p }),

    downloadUpdate: async () => {
      try { const { check } = await import("@tauri-apps/plugin-updater"); const u = await check(); if (u) await u.downloadAndInstall(); } catch (e) {}
    },
    installUpdate: async () => {
      try { const { check } = await import("@tauri-apps/plugin-updater"); const u = await check(); if (u) await u.install(); } catch (e) {}
    },

    onUpdateAvailable: (cb) => { listen("update-available", cb); return () => {}; },
    onUpdateProgress: (cb) => { listen("update-progress", ({ payload }) => cb(payload)); return () => {}; },
    onUpdateDownloaded: (cb) => { listen("update-downloaded", cb); return () => {}; },

    getClipboardText: async () => {
      return "";
    },
    getClipboardImage: async () => {
      return null;
    },

    restartBackend: () => invoke("restart_backend"),
    importJSON: () => invoke("import_json"),

    startAudioCapture: () => invoke("start_audio_capture"),
    stopAudioCapture: () => invoke("stop_audio_capture"),

    onBackendRestart: (cb) => { listen("backend-restarting", ({ payload }) => cb(null, payload)); return () => {}; },
    onBeforeMinimize: () => () => {},
    onRestore: () => () => {},
    completeMinimize: () => {},
  };
}
