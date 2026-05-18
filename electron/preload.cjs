const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("aivexWindow", {
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),

  getClipboardText: () => ipcRenderer.invoke("clipboard:getText"),
  getClipboardImage: () => ipcRenderer.invoke("clipboard:getImage"),
});