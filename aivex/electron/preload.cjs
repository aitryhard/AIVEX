const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("aivexWindow", {
  minimize: () => ipcRenderer.send("window:minimize"),

  maximize: () => ipcRenderer.send("window:maximize"),

  close: () => ipcRenderer.send("window:close"),

  getVersion: () => ipcRenderer.invoke("app:getVersion"),

  getClipboardText: () => ipcRenderer.invoke("clipboard:getText"),

  getClipboardImage: () => ipcRenderer.invoke("clipboard:getImage"),

  onUpdateAvailable: (callback) => {
    ipcRenderer.on("update:available", callback);
    return () => ipcRenderer.removeListener("update:available", callback);
  },

  onUpdateProgress: (callback) => {
    ipcRenderer.on("update:download-progress", (_event, progress) => callback(progress));
    return () => ipcRenderer.removeListener("update:download-progress", callback);
  },

  onUpdateDownloaded: (callback) => {
    ipcRenderer.on("update:downloaded", callback);
    return () => ipcRenderer.removeListener("update:downloaded", callback);
  },

  getActivationStatus: () => ipcRenderer.invoke("activation:getStatus"),

  downloadUpdate: () => ipcRenderer.send("update:download"),

  installUpdate: () => ipcRenderer.send("update:install"),

  saveTextFile: (content, suggestedName) => ipcRenderer.invoke("file:saveText", content, suggestedName),

  openFile: (filePath) => ipcRenderer.invoke("file:open", filePath),

  openImage: (dataUrl) => ipcRenderer.invoke("image:open", dataUrl),

  onBackendRestart: (callback) => {
    ipcRenderer.on("backend:restarting", callback);

    return () => ipcRenderer.removeListener("backend:restarting", callback);
  },

  restartBackend: () => ipcRenderer.invoke("backend:restart"),

  onBeforeMinimize: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("window:before-minimize", handler);
    return () => ipcRenderer.removeListener("window:before-minimize", handler);
  },

  onRestore: (callback) => {
    ipcRenderer.on("window:restored", callback);
    return () => ipcRenderer.removeListener("window:restored", callback);
  },

  completeMinimize: () => ipcRenderer.send("window:complete-minimize"),

  resizeWindow: (width, height) => ipcRenderer.invoke("window:resize", width, height),
  resetWindowSize: () => ipcRenderer.invoke("window:resetSize"),
  getScreenSize: () => ipcRenderer.invoke("screen:getSize"),
  captureScreen: () => ipcRenderer.invoke("screen:capture"),
  getSubscription: () => ipcRenderer.invoke("subscription:getStatus"),
  getAlwaysOnTop: () => ipcRenderer.invoke("window:getAlwaysOnTop"),
  setAlwaysOnTop: (value) => ipcRenderer.invoke("window:setAlwaysOnTop", value),
  getDeviceId: () => ipcRenderer.invoke("device:getId"),
  openExternal: (url) => ipcRenderer.invoke("shell:openExternal", url),
  createPayment: (tier) => ipcRenderer.invoke("payment:create", tier),
});
