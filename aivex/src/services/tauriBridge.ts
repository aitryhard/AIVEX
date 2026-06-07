import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { UpdateProgress, BackendRestartInfo } from "../types";

export async function initTauriBridge(): Promise<void> {
  if (!window.__TAURI_INTERNALS__) return;

  let prevClipboardUrl: string | null = null;

  window.aivexWindow = {
    minimize: () => invoke("minimize"),
    maximize: () => invoke("maximize"),
    close: () => invoke("close"),

    getVersion: () => invoke("get_version"),
    getDeviceId: () => invoke("get_device_id"),
    getSubscription: () => invoke("get_subscription"),
    createPayment: (tier: string) => invoke("create_payment", { tier }),

    getAlwaysOnTop: () => invoke("get_always_on_top"),
    setAlwaysOnTop: (v: boolean) => invoke("set_always_on_top", { value: v }),

    resizeWindow: (w: number, h: number) => invoke("resize_window", { width: w, height: h }),
    resetWindowSize: () => invoke("reset_window_size"),

    saveTextFile: (c: string, n: string) => invoke("save_text_file", { content: c, name: n }),
    openExternal: (url: string) => invoke("open_external", { url }),
    openFile: (p: string) => invoke("open_external", { url: p }),

    downloadUpdate: async () => {
      try { const { check } = await import("@tauri-apps/plugin-updater"); const u = await check(); if (u) await u.downloadAndInstall(); } catch { /* non-critical */ }
    },
    installUpdate: async () => {
      try { const { check } = await import("@tauri-apps/plugin-updater"); const u = await check(); if (u) await u.install(); } catch { /* non-critical */ }
    },

    onUpdateAvailable: (cb) => {
      const p = listen<unknown>("update-available", cb);
      return () => { p.then((fn: UnlistenFn) => fn()); };
    },
    onUpdateProgress: (cb) => {
      const p = listen<UpdateProgress>("update-progress", (event) => cb(event.payload));
      return () => { p.then((fn: UnlistenFn) => fn()); };
    },
    onUpdateDownloaded: (cb) => {
      const p = listen<unknown>("update-downloaded", cb);
      return () => { p.then((fn: UnlistenFn) => fn()); };
    },

    getClipboardText: async () => {
      try {
        const { readText } = await import("@tauri-apps/plugin-clipboard-manager");
        return await readText();
      } catch { return ""; }
    },
    getClipboardImage: async () => {
      try {
        const { readImage } = await import("@tauri-apps/plugin-clipboard-manager");
        const img = await readImage();
        const buf = await img.rgba();
        const blob = new Blob([buf as unknown as BlobPart], { type: "image/png" });
        if (prevClipboardUrl) URL.revokeObjectURL(prevClipboardUrl);
        prevClipboardUrl = URL.createObjectURL(blob);
        return prevClipboardUrl;
      } catch { return null; }
    },

    restartBackend: () => invoke("restart_backend"),
    importJSON: () => invoke("import_json"),

    startAudioCapture: () => invoke("start_audio_capture"),
    stopAudioCapture: () => invoke("stop_audio_capture"),

    onBackendRestart: (cb) => {
      const p = listen<BackendRestartInfo>("backend-restarting", (event) => cb(null, event.payload));
      return () => { p.then((fn: UnlistenFn) => fn()); };
    },
    onBeforeMinimize: () => () => {},
    onRestore: () => () => {},
    completeMinimize: () => {},
  };
}
