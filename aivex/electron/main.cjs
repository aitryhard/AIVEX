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
  screen,
  globalShortcut,
} = require("electron");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { shell } = require("electron");
const { machineIdSync } = require("node-machine-id");

const isDev = !app.isPackaged;

const ACTIVATION_SERVER = "https://server-activation-06sn.onrender.com";

autoUpdater.autoDownload = false;

let backendProcess = null;
let mainWindow = null;
let currentActivation = null;
let activationCache = null;
let activationCacheTime = 0;
const ACTIVATION_CACHE_TTL = 30000;

let backendStartTime = 0;
let backendStarting = false;
let backendRestartCount = 0;
let backendRestartTimer = null;
const MAX_BACKEND_RESTART = 5;
let isQuitting = false;

async function checkActivation() {
  const now = Date.now();

  if (activationCache && (now - activationCacheTime) < ACTIVATION_CACHE_TTL) {
    return activationCache;
  }
  try {
    const deviceId = machineIdSync();

    console.log("Activation server:", ACTIVATION_SERVER);
    console.log("Sending activation request...");

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

    activationCache = result;
    activationCacheTime = now;

    return result;
  } catch (err) {
    console.error("Activation FULL error:", err);

    activationCache = {
      allowed: false,
      status: "server_error",
    };
    activationCacheTime = now;

    return activationCache;
  }
}

async function startBackend() {
  if (backendStarting || backendProcess) return;
  backendStarting = true;

  const backendPath = isDev
    ? path.join(__dirname, "..", "backend", "main.py")
    : path.join(process.resourcesPath, "backend", "aivex-backend.exe");

  try {
    require("child_process").execSync(
      `for /f "tokens=5" %a in ('netstat -ano ^| find ":8000 " ^| find "LISTENING"') do taskkill /f /pid %a 2>nul`,
      { stdio: "ignore", timeout: 5000 }
    );
  } catch {}

  await new Promise((r) => setTimeout(r, 1000));

  const spawnOptions = isDev
    ? {
        cwd: path.join(__dirname, "..", "backend"),
        detached: false,
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
      }
    : {
        cwd: path.join(process.resourcesPath, "backend"),
        detached: false,
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
      };

  const spawnCommand = isDev
    ? path.join(__dirname, "..", "..", ".venv", "Scripts", "python.exe")
    : backendPath;

  const spawnArgs = isDev ? [backendPath] : [];

  console.log(`Backend: запуск из ${backendPath}`);

  clearTimeout(backendRestartTimer);

  backendRestartTimer = setTimeout(() => {
    backendRestartCount = 0;
    console.log("Backend: счётчик перезапусков сброшен (прожил 30с)");
  }, 30000);

  backendProcess = spawn(spawnCommand, spawnArgs, spawnOptions);

  let stderrData = "";
  let stdoutData = "";

  backendProcess.stdout.on("data", (data) => {
    stdoutData += data.toString();
    console.log(`[BACKEND stdout] ${data.toString().trim()}`);
  });

  backendProcess.stderr.on("data", (data) => {
    stderrData += data.toString();
    console.log(`[BACKEND stderr] ${data.toString().trim()}`);
  });

  backendStartTime = Date.now();
  const pid = backendProcess.pid;

  console.log(`Backend: процесс запущен, PID ${pid}`);
  backendStarting = false;

  backendProcess.on("exit", (code) => {
    const uptime = Date.now() - backendStartTime;

    const stderrSummary = stderrData
      ? stderrData.split("\n").filter(l => l.trim()).slice(-3).join(" | ")
      : "";
    console.log(`Backend [PID ${pid}]: завершён с кодом ${code}, прожил ${uptime}мс`);
    console.log(`Backend STDERR: ${stderrSummary || "(пусто)"}`);

    if (stderrData) {
      console.log(`Backend [PID ${pid}] STDERR:\n${stderrData}`);
    }

    if (stdoutData) {
      console.log(`Backend [PID ${pid}] STDOUT:\n${stdoutData}`);
    }

    if (backendProcess && backendProcess.pid === pid) {
      backendProcess = null;
    }

    if (isQuitting || code === 0) return;

    if (uptime < 10000) {
      backendRestartCount++;
    }

    if (backendRestartCount >= MAX_BACKEND_RESTART) {
      console.log(`Backend: превышен лимит перезапусков (${MAX_BACKEND_RESTART}), останавливаю`);

      mainWindow?.webContents.send("backend:restarting", {
        attempt: backendRestartCount,
        max: MAX_BACKEND_RESTART,
        fatal: true,
        error: stderrSummary || `Exit code: ${code}, uptime: ${uptime}ms`,
      });
      return;
    }

    mainWindow?.webContents.send("backend:restarting", {
      attempt: backendRestartCount,
      max: MAX_BACKEND_RESTART,
      error: stderrSummary || `Exit code: ${code}, uptime: ${uptime}ms`,
    });
  });

  backendProcess.on("error", (err) => {
    console.log(`Backend [PID ${pid}]: ошибка запуска:`, err.message);
  });
}

function stopBackend() {
  if (!backendProcess) return;

  const pid = backendProcess.pid;

  try {
    backendProcess.kill();
  } catch (error) {
    console.log("Backend kill error:", error);
  }

  backendProcess = null;

  try {
    require("child_process").execSync(
      `taskkill /f /pid ${pid} 2>nul`,
      { stdio: "ignore", timeout: 3000 }
    );
  } catch {}
}

function createWindow() {
    mainWindow = new BrowserWindow({
    width: 430,
    height: 760,
    minWidth: 430,
    minHeight: 760,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    focusable: true,
    backgroundColor: "#00000000",
    show: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "dist", "index.html"));
  }
  mainWindow.show();
  mainWindow.setAlwaysOnTop(true);
  mainWindow.moveTop();

  mainWindow.on("restore", () => {
    try {
      if (!mainWindow.isDestroyed() && mainWindow.webContents) {
        mainWindow.webContents.send("window:restored");
      }
    } catch (_) {}
  });
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

  try {
    globalShortcut.register("CommandOrControl+Shift+A", () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("screenpeek:toggle");
      }
    });
  } catch (e) {
    console.log("Global shortcut error:", e);
  }
});

autoUpdater.on("update-available", () => {
  mainWindow?.webContents.send("update:available");
});

autoUpdater.on("update-downloaded", () => {
  mainWindow?.webContents.send("update:downloaded");
});

autoUpdater.on("download-progress", (progress) => {
  mainWindow?.webContents.send("update:download-progress", {
    percent: Math.round(progress.percent),
    bytesPerSecond: progress.bytesPerSecond,
    transferred: progress.transferred,
    total: progress.total,
  });
});

autoUpdater.on("error", (err) => {
  console.log("Updater error:", err);
});

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

ipcMain.on("update:download", () => {
  autoUpdater.downloadUpdate();
});

ipcMain.on("update:install", () => {
  stopBackend();
  setTimeout(() => {
    autoUpdater.quitAndInstall();
  }, 1000);
});

ipcMain.on("window:minimize", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;
  try { win.webContents.send("window:before-minimize"); } catch (_) {}
});

ipcMain.on("window:complete-minimize", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win && !win.isDestroyed()) win.minimize();
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

ipcMain.handle("file:saveText", async (_event, content, suggestedName) => {
  const name = suggestedName
    ? suggestedName.replace(/[<>:"/\\|?*]/g, "_").slice(0, 100) + ".txt"
    : "aivex-response.txt";

  const result = await dialog.showSaveDialog(mainWindow, {
    title: "Сохранить ответ Aivex",
    defaultPath: name,
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

ipcMain.handle("file:open", async (_, filePath) => {
  try {
    await shell.openPath(filePath);
    return { opened: true };
  } catch (_) {
    return { opened: false };
  }
});

ipcMain.handle("image:open", async (_event, dataUrl) => {
  try {
    const matches = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) {
      console.log("[image:open] invalid dataUrl prefix:", dataUrl?.slice(0, 50));
      return { opened: false };
    }
    const ext = matches[1].split("/")[1].replace("jpeg", "jpg");
    const buffer = Buffer.from(matches[2], "base64");
    const tmpPath = path.join(app.getPath("temp"), `aivex-img-${Date.now()}.${ext}`);
    fs.writeFileSync(tmpPath, buffer);
    const err = await shell.openPath(tmpPath);
    if (err) console.log("[image:open] shell.openPath error:", err);
    return { opened: !err };
  } catch (e) {
    console.log("[image:open] error:", e);
    return { opened: false };
  }
});

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

  if (currentActivation.allowed && !backendProcess && !backendStarting && backendRestartCount < MAX_BACKEND_RESTART) {
    await startBackend();
  }

  return currentActivation;
});

ipcMain.handle("backend:restart", async () => {
  stopBackend();
  await startBackend();
  return { restarted: true };
});

ipcMain.handle("window:resize", (_event, width, height) => {
  const win = BrowserWindow.getFocusedWindow() || mainWindow;
  if (!win || win.isDestroyed()) return;
  win.setSize(width, height);
  win.center();
});

ipcMain.handle("window:resetSize", () => {
  const win = BrowserWindow.getFocusedWindow() || mainWindow;
  if (!win || win.isDestroyed()) return;
  win.setSize(430, 760);
  win.center();
});

ipcMain.handle("window:getAlwaysOnTop", () => {
  if (!mainWindow || mainWindow.isDestroyed()) return true;
  return mainWindow.isAlwaysOnTop();
});

ipcMain.handle("window:setAlwaysOnTop", (_event, value) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.setAlwaysOnTop(value);
});

ipcMain.handle("screen:getSize", () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  return primaryDisplay.workAreaSize;
});

ipcMain.handle("screen:capture", async () => {
  const sources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: { width: 1280, height: 720 },
  });
  if (!sources.length) return null;

  let img = sources[0].thumbnail;

  const w = img.getSize().width;
  const h = img.getSize().height;
  const cropW = Math.min(640, w);
  const cropH = Math.min(480, h);
  const x = Math.floor((w - cropW) / 2);
  const y = Math.floor((h - cropH) / 2);
  img = img.crop({ x, y, width: cropW, height: cropH });

  return img.toDataURL({ format: 'jpeg', quality: 0.6 });
});

ipcMain.handle("app:getVersion", () => {
  return app.getVersion();
});

ipcMain.handle("device:getId", () => {
  return machineIdSync();
});

ipcMain.handle("shell:openExternal", async (_event, url) => {
  try {
    await shell.openExternal(url);
  } catch (err) {
    console.error("shell:openExternal error:", err);
  }
});

ipcMain.handle("subscription:getStatus", async () => {
  try {
    const deviceId = machineIdSync();
    const response = await fetch(
      `${ACTIVATION_SERVER}/subscription/by-device/${deviceId}`,
      { signal: AbortSignal.timeout(10000) },
    );
    return await response.json();
  } catch {
    return { tier: "free", is_active: false };
  }
});

ipcMain.handle("payment:create", async (_event, tier) => {
  try {
    const deviceId = machineIdSync();
    const response = await fetch(
      `${ACTIVATION_SERVER}/payment/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: deviceId, tier }),
        signal: AbortSignal.timeout(15000),
      },
    );
    return await response.json();
  } catch {
    return { error: "server_unreachable" };
  }
});

app.on("before-quit", () => {
  isQuitting = true;
  stopBackend();
});

app.on("quit", () => {
  isQuitting = true;
  stopBackend();
});

app.on("window-all-closed", () => {
  isQuitting = true;
  stopBackend();

  if (process.platform !== "darwin") {
    app.quit();
  }
});
