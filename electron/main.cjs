const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const {
  app,
  BrowserWindow,
  ipcMain,
  clipboard,
  dialog,
  desktopCapturer,
  session,
} = require("electron");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { machineIdSync } = require("node-machine-id");

const isDev = !app.isPackaged;

const ACTIVATION_SERVER = "https://server-activation-06sn.onrender.com";

autoUpdater.autoDownload = true;

let backendProcess = null;
let mainWindow = null;
let currentActivation = null;

async function checkActivation() {
  try {
    const deviceId = machineIdSync();

    console.log("Activation server:", ACTIVATION_SERVER);
    console.log("Sending activation request...");

    // REQUEST ACCESS

    const requestController = new AbortController();

    const requestTimeout = setTimeout(() => {
      requestController.abort();
    }, 30000);

    await fetch(`${ACTIVATION_SERVER}/request-access`, {
      signal: requestController.signal,

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        deviceId,
        appVersion: app.getVersion(),
        platform: process.platform,
        username: process.env.USERNAME || "unknown",
      }),
    });

    clearTimeout(requestTimeout);

    // CHECK ACCESS

    const checkController = new AbortController();

    const checkTimeout = setTimeout(() => {
      checkController.abort();
    }, 30000);

    const response = await fetch(`${ACTIVATION_SERVER}/check-access`, {
      signal: checkController.signal,

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        deviceId,
      }),
    });

    clearTimeout(checkTimeout);

    const result = await response.json();

    console.log("Activation result:", result);

    return result;
  } catch (err) {
    console.error("Activation FULL error:", err);

    return {
      allowed: false,
      status: "server_error",
    };
  }
}

function startBackend() {
  const backendPath = isDev
    ? path.join(__dirname, "..", "backend", "dist", "aivex-backend.exe")
    : path.join(process.resourcesPath, "backend", "aivex-backend.exe");

  backendProcess = spawn(backendPath, [], {
    cwd: isDev
      ? path.join(__dirname, "..", "backend", "dist")
      : path.join(process.resourcesPath, "backend"),
    detached: false,
    windowsHide: true,
    stdio: ["ignore", "ignore", "ignore"],
  });
}

function stopBackend() {
  if (!backendProcess) return;

  try {
    backendProcess.kill("SIGTERM");
  } catch (error) {
    console.log("Backend kill error:", error);
  }

  backendProcess = null;
}

function createWindow() {
  mainWindow = new BrowserWindow({
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
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "dist", "index.html"));
  }
}

app.whenReady().then(async () => {
  session.defaultSession.setDisplayMediaRequestHandler(
    async (request, callback) => {
      const sources = await desktopCapturer.getSources({
        types: ["screen", "window"],
      });

      callback({
        video: sources[0],
        audio: "loopback",
      });
    },
  );
  const activation = await checkActivation();

  currentActivation = activation;

  console.log("Activation:", activation);

  createWindow();

  if (activation.allowed) {
    setTimeout(() => {
      startBackend();
    }, 1200);
  }

  if (!isDev) {
    autoUpdater.setFeedURL({
      provider: "github",
      owner: "aitryhard",
      repo: "AIVEX",
    });

    autoUpdater.checkForUpdates().catch((error) => {
      console.log("Update check failed:", error);
    });
  }
});

autoUpdater.on("update-available", () => {
  mainWindow?.webContents.send("update:available");
});

autoUpdater.on("update-downloaded", () => {
  mainWindow?.webContents.send("update:downloaded");
});

autoUpdater.on("error", (err) => {
  console.log("Updater error:", err);
});

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

autoUpdater.logger = require("electron-log");

ipcMain.on("update:install", () => {
  autoUpdater.quitAndInstall();
});

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

ipcMain.handle("file:saveText", async (_, content) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "Сохранить ответ Aivex",
    defaultPath: "aivex-response.txt",
    filters: [{ name: "Text File", extensions: ["txt"] }],
  });

  if (result.canceled || !result.filePath) {
    return { saved: false };
  }

  fs.writeFileSync(result.filePath, content, "utf-8");

  return {
    saved: true,
    path: result.filePath,
  };
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

ipcMain.handle("activation:getStatus", async () => {
  currentActivation = await checkActivation();

  if (currentActivation.allowed && !backendProcess) {
    startBackend();
  }

  return currentActivation;
});

ipcMain.handle("app:getVersion", () => {
  return app.getVersion();
});

app.on("before-quit", stopBackend);

app.on("quit", stopBackend);

app.on("window-all-closed", () => {
  stopBackend();

  if (process.platform !== "darwin") {
    app.quit();
  }
});
