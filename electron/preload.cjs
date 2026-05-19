const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("aivexWindow", {
  minimize: () => ipcRenderer.send("window:minimize"),

  maximize: () => ipcRenderer.send("window:maximize"),

  close: () => ipcRenderer.send("window:close"),

  getVersion: () => ipcRenderer.invoke("app:getVersion"),

  getClipboardText: () =>
    ipcRenderer.invoke("clipboard:getText"),

  getClipboardImage: () =>
    ipcRenderer.invoke("clipboard:getImage"),

  onUpdateAvailable: (callback) =>
    ipcRenderer.on("update:available", callback),

  onUpdateDownloaded: (callback) =>
    ipcRenderer.on("update:downloaded", callback),

  getActivationStatus: () =>
  ipcRenderer.invoke("activation:getStatus"),

  installUpdate: () =>
    ipcRenderer.send("update:install"),

  saveTextFile: (content) =>
  ipcRenderer.invoke("file:saveText", content),
  
});