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
let isQuitting = false;

/* Функция для проверки активации приложения с кэшированием на 30 секунд. */

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

/* Функция для запуска бэкенда в виде отдельного процесса. */

async function startBackend() {
  if (backendStarting || backendProcess) return;
  backendStarting = true;

  const backendPath = isDev
    ? path.join(__dirname, "..", "backend", "main.py")
    : path.join(process.resourcesPath, "backend", "aivex-backend.exe");

  /* Убиваем старые процессы, которые могли зависнуть на порту 8000 */

  try {
    require("child_process").execSync(
      "taskkill /f /im python.exe 2>nul & taskkill /f /im aivex-backend.exe 2>nul",
      { stdio: "ignore" }
    );
  } catch {
    /* если процесса нет — игнорируем */
  }

  /* Ждём чтобы порт освободился */

  await new Promise((r) => setTimeout(r, 500));

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

    console.log(`Backend [PID ${pid}]: завершён с кодом ${code}, прожил ${uptime}мс`);

    if (stderrData) {
      console.log(`Backend [PID ${pid}] STDERR:\n${stderrData}`);
    }

    if (stdoutData) {
      console.log(`Backend [PID ${pid}] STDOUT:\n${stdoutData}`);
    }

    /* Зануляем ссылку только если это всё ещё тот же процесс */

    if (backendProcess && backendProcess.pid === pid) {
      backendProcess = null;
    }

    if (isQuitting || code === 0) return;

    mainWindow?.webContents.send("backend:restarting", {
      attempt: 1,
      max: 5,
    });
  });

  backendProcess.on("error", (err) => {
    console.log(`Backend [PID ${pid}]: ошибка запуска:`, err.message);
  });
}

/* Функция для корректного завершения процесса бэкенда при выходе из приложения. */

function stopBackend() {
  if (!backendProcess) return;

  try {
    backendProcess.kill("SIGTERM");
  } catch (error) {
    console.log("Backend kill error:", error);
  }

  backendProcess = null;
}

/* Создание главного окна приложения с заданными параметрами и загрузкой интерфейса. */

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
    skipTaskbar: false,
    focusable: true,
    backgroundColor: "#00000000",
    show: true,
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

/* Загрузка обновления после подтверждения пользователем */

ipcMain.on("update:download", () => {
  autoUpdater.downloadUpdate();
});

/* Установка обновления после загрузки */

ipcMain.on("update:install", () => {
  autoUpdater.quitAndInstall();
});

/* УПРАВЛЕНИЕ ОКНОМ */

ipcMain.on("window:minimize", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;
  try { win.webContents.send("window:before-minimize"); } catch (_) {}
});

ipcMain.on("window:complete-minimize", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win && !win.isDestroyed()) win.minimize();
});

/* Максимизация/восстановление окна по клику на кнопку */

ipcMain.on("window:maximize", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;

  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

/* --- IGNORE --- */

ipcMain.on("window:close", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});

/* СОХРАНЕНИЕ В ФАЙЛ */

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

/* БУФЕР ОБМЕНА */

ipcMain.handle("clipboard:getText", () => {
  return clipboard.readText();
});

/* Буфер обмена для изображений (скриншоты, копирование из других приложений) */

ipcMain.handle("clipboard:getImage", () => {
  const image = clipboard.readImage();

  if (image.isEmpty()) {
    return null;
  }

  return image.toDataURL();
});

/* АКТИВАЦИЯ */

ipcMain.handle("activation:getStatus", async () => {
  currentActivation = await checkActivation();

  if (currentActivation.allowed && !backendProcess && !backendStarting) {
    startBackend();
  }

  return currentActivation;
});

/* ПЕРЕЗАПУСК БЭКЕНДА */

ipcMain.handle("backend:restart", async () => {
  stopBackend();
  await startBackend();
  return { restarted: true };
});

/* ОБЩЕЕ */

ipcMain.handle("app:getVersion", () => {
  return app.getVersion();
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
