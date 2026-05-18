const { app, BrowserWindow, ipcMain, clipboard } = require("electron");
const path = require("path");

const isDev = !app.isPackaged; // РЕЖИМ РАЗРАБОТКИ

function createWindow() {
  const win = new BrowserWindow({
    width: 430,
    height: 760,

    minWidth: 380,
    minHeight: 520,

    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    backgroundColor: "#00000000",

    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(app.getAppPath(), "dist", "index.html"));
  }
}

app.whenReady().then(createWindow);

/* УПРАВЛЕНИЕ ОКНОМ */

ipcMain.on("window:minimize", () => {
  const win = BrowserWindow.getFocusedWindow();

  if (win) win.minimize();
});

ipcMain.on("window:maximize", () => {
  const win = BrowserWindow.getFocusedWindow();

  if (!win) return;

  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

ipcMain.on("window:close", () => {
  const win = BrowserWindow.getFocusedWindow();

  if (win) win.close();
});

/* БУФЕР ОБМЕНА */

ipcMain.handle("clipboard:getText", () => {
  return clipboard.readText();
});

ipcMain.handle("clipboard:getImage", () => {
  const image = clipboard.readImage();

  if (image.isEmpty()) {
    return null;
  }

  return image.toDataURL();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});