"use strict";

import { app, protocol, BrowserWindow, Menu, Tray, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import fs from "fs";
import path from "path";
const isDevelopment = process.env.NODE_ENV !== "production";
// Scheme must be registered before the app is ready
const dataPath =
  process.env.NODE_ENV === "development"
    ? path.join(__dirname, "../data")
    : path.join(process.resourcesPath, "data");
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true }, stream: true },
]);
let settingWindow = null,
  screenFilterWindow = null,
  warningMessageWindow = null,
  faceProcessWindow = null,
  stretchGuideWindow = null,
  loadingWindow = null;
let tray = null;

const setting = JSON.parse(
  fs.readFileSync(path.join(dataPath, "setting.json"))
);

function registerLocalVideoProtocol() {
  protocol.registerFileProtocol("local-video", (request, callback) => {
    const url = request.url.replace(/^local-video:\/\//, "");
    // Decode URL to prevent errors when loading filenames with UTF-8 chars or chars like "#"
    const decodedUrl = decodeURI(url); // Needed in case URL contains spaces
    try {
      // eslint-disable-next-line no-undef
      return callback(path.join(__static, decodedUrl));
    } catch (error) {
      console.error(
        "ERROR: registerLocalVideoProtocol: Could not get file path:",
        error
      );
    }
  });
}

function registerLocalAudioProtocol() {
  protocol.registerFileProtocol("local-audio", (request, callback) => {
    const url = request.url.replace(/^local-audio:\/\//, "");
    // Decode URL to prevent errors when loading filenames with UTF-8 chars or chars like "#"
    const decodedUrl = decodeURI(url); // Needed in case URL contains spaces
    try {
      // eslint-disable-next-line no-undef
      return callback(path.join(__static, decodedUrl));
    } catch (error) {
      console.error(
        "ERROR: registerLocalAudioProtocol: Could not get file path:",
        error
      );
    }
  });
}

function createWindow(devPath, prodPath, options, isSettingWindow) {
  let window = new BrowserWindow(options);
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    window.loadURL(process.env.WEBPACK_DEV_SERVER_URL + devPath);
    if (!process.env.IS_TEST) window.webContents.openDevTools();
  } else {
    // Load the index.html when not in development
    window.loadURL(`app://./${prodPath}`);
  }

  window.on("closed", () => {
    window = null;
  });
  return window;
}
function createTray(icon) {
  let tray = new Tray(icon); //?????? ????????? ??????
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "setting",
      type: "normal",
      click() {
        settingWindow.show();
      },
    },
    {
      label: "exit",
      type: "normal",
      click() {
        fs.writeFileSync(
          path.join(dataPath, "setting.json"),
          JSON.stringify(setting)
        );
        screenFilterWindow.close();
        warningMessageWindow.close();
        faceProcessWindow.close();
        stretchGuideWindow.close();
        settingWindow.destroy();
      },
    },
  ]);
  tray.setToolTip("eye-guardian");
  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => {
    settingWindow.show();
  });
  return tray;
}
// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  registerLocalVideoProtocol();
  registerLocalAudioProtocol();
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  if (!process.env.WEBPACK_DEV_SERVER_URL) {
    createProtocol("app");
  }
  loadingWindow = createWindow(
    "loading/index.html",
    "loading/index.html",
    {
      width: 290,
      height: 360,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        devTools: false,
      },
    },
    false
  );
  settingWindow = createWindow(
    "",
    "index.html",
    {
      width: 1000,
      height: 750,
      frame: false,
      show: false,
      backgroundColor: "#32353B",
      webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      },
      icon: path.join(__static, "/images/logo.ico"),
    },
    true
  );
  settingWindow.on("close", (e) => {
    //?????? ????????? ?????? ????????? ?????? ???
    e.preventDefault();
    settingWindow.hide();
  });
  settingWindow.isReady = false;
  settingWindow.once("ready-to-show", () => {
    loadingWindow.close();
    settingWindow.show();
  });
  warningMessageWindow = createWindow(
    "/#/warningMessage",
    "index.html#warningMessage",
    {
      webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        devTools: false,
      },
      fullscreen: true,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      focusable: false,
      resizable: false,
    },
    false
  );
  warningMessageWindow.setIgnoreMouseEvents(true);
  warningMessageWindow.setAlwaysOnTop(true, "normal");
  screenFilterWindow = createWindow(
    "filter/index.html",
    "filter/index.html",
    {
      webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        devTools: false,
      },
      fullscreen: true,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      focusable: false,
      resizable: false,
    },
    false
  );
  screenFilterWindow.setIgnoreMouseEvents(true);
  screenFilterWindow.setAlwaysOnTop(true, "normal");

  stretchGuideWindow = createWindow(
    "stretch/index.html",
    "stretch/index.html",
    {
      webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        webSecurity: true,
        devTools: false,
      },
      useContentSize: true,
      alwaysOnTop: true,
      frame: false,
      show: false,
    },
    false
  );
  faceProcessWindow = createWindow(
    "face/index.html",
    "face/index.html",
    {
      webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      },
      useContentSize: true,
      show: false,
    },
    false
  );
  tray = createTray(path.join(__static, "/images/logo.ico"));
});

ipcMain.on("REQUEST_INIT_SCREEN_VALUE", (evt, payload) => {
  switch (payload) {
    case "settingPage": {
      settingWindow.isReady = true;
      settingWindow.send("INIT", setting);
      break;
    }
    case "screenFilter": {
      screenFilterWindow.send("INIT", setting);
      break;
    }
    case "warningMessage": {
      warningMessageWindow.send("INIT", setting);
      break;
    }
    case "faceProcess": {
      faceProcessWindow.send("INIT", setting);
      break;
    }
    case "stretchGuide": {
      stretchGuideWindow.send("INIT", setting);
      break;
    }
  }
});

//set show stretch_guide
ipcMain.on("SHOW_STRETCH_GUIDE", (evt, payload) => {
  stretchGuideWindow.show();
  stretchGuideWindow.send("PLAY_STRETCH_GUIDE");
});
ipcMain.on("HIDE_STRETCH_GUIDE", (evt, payload) => {
  stretchGuideWindow.hide();
});

//set screenFilter
ipcMain.on("SET_BLUELIGHT_FILTER_SHOW", (evt, payload) => {
  setting.screenFilter.isBlueLightFilterOn = payload;
  screenFilterWindow.send("SET_BLUELIGHT_FILTER_SHOW", payload);
});
ipcMain.on("SET_DARKNESS", (evt, payload) => {
  setting.screenFilter.darkness = payload;
  screenFilterWindow.send("SET_DARKNESS", payload);
});
ipcMain.on("SET_BLUELIGHT_FIGURE", (evt, payload) => {
  setting.screenFilter.blueLightFigure = payload;
  screenFilterWindow.send("SET_BLUELIGHT_FIGURE", payload);
});

//set warningMessage
ipcMain.on("SET_WARNING_MODE", (evt, payload) => {
  setting.warningMessage.mode = payload;
  warningMessageWindow.send("SET_WARNING_MODE", payload);
});
ipcMain.on("INSERT_MESSAGE", (evt, payload) => {
  warningMessageWindow.send("INSERT_MESSAGE", payload);
});
ipcMain.on("SET_WARNING_VOLUME", (evt, payload) => {
  warningMessageWindow.send("SET_WARNING_VOLUME", payload);
});

//?????? ?????? ??????
ipcMain.on("ESTIMATE_DISTANCE", (evt, payload) => {
  faceProcessWindow.send("ESTIMATE_DISTANCE");
});
ipcMain.on("MEASURE_EYESIZE", (evt, payload) => {
  faceProcessWindow.send("MEASURE_EYESIZE");
});
ipcMain.on("SET_FACE_DISTANCE", (evt, payload) => {
  setting.faceProcess.faceLength = payload;
  settingWindow.send("SET_FACE_DISTANCE_SUCCESS", true);
});
ipcMain.on("NO_FACE", (evt, payload) => {
  settingWindow.send("NO_FACE", payload);
});
ipcMain.on("SET_EYESIZE_DISTANCE", (evt, payload) => {
  setting.faceProcess.leftEyeXSize = payload.leftEyeXSize;
  setting.faceProcess.leftEyeYSize = payload.leftEyeYSize;
  setting.faceProcess.rightEyeXSize = payload.rightEyeXSize;
  setting.faceProcess.rightEyeYSize = payload.rightEyeYSize;
  settingWindow.send("SET_EYESIZE_DISTANCE_SUCCESS", true);
});
//????????? ?????? ?????? ??????
ipcMain.on("LOAD_CAMERA_SUCCESS", (evt, payload) => {
  const sendAfterReady = () => {
    if (settingWindow.isReady) {
      settingWindow.send("LOAD_CAMERA_SUCCESS", true);
    } else {
      setTimeout(sendAfterReady, 1000);
    }
  };
  sendAfterReady();
});
ipcMain.on("LOAD_CAMERA_FAILED", (evt, payload) => {
  const sendAfterReady = () => {
    if (settingWindow.isReady) {
      settingWindow.send("LOAD_CAMERA_FAILED", true);
    } else {
      setTimeout(sendAfterReady, 1000);
    }
  };
  sendAfterReady();
});
//???????????? ?????? ???????????? ????????????
ipcMain.on("LOAD_MODEL_SUCCESS", (evt, payload) => {
  const sendAfterReady = () => {
    if (settingWindow.isReady) {
      settingWindow.send("LOAD_MODEL_SUCCESS", true);
    } else {
      setTimeout(sendAfterReady, 1000);
    }
  };
  sendAfterReady();
});
ipcMain.on("LOAD_MODEL_FAILED", (evt, payload) => {
  const sendAfterReady = () => {
    if (settingWindow.isReady) {
      settingWindow.send("LOAD_MODEL_FAILED", true);
    } else {
      setTimeout(sendAfterReady, 1000);
    }
  };
  sendAfterReady();
});

//??? ?????? On Off ??????
ipcMain.on("SET_DISTANCE_WARNING", (evt, payload) => {
  setting.faceProcess.isDistanceWarningOn = payload;
  faceProcessWindow.send("SET_DISTANCE_WARNING", payload);
});
ipcMain.on("SET_STARE_WARNING", (evt, payload) => {
  setting.faceProcess.isStareWarningOn = payload;
  faceProcessWindow.send("SET_STARE_WARNING", payload);
});
ipcMain.on("SET_EYEBLINK_WARNING", (evt, payload) => {
  setting.faceProcess.isEyeblinkWarningOn = payload;
  faceProcessWindow.send("SET_EYEBLINK_WARNING", payload);
});
ipcMain.on("SET_AUTO_DARKNESS_CONTROL", (evt, payload) => {
  setting.faceProcess.isAutoDarknessControlOn = payload;
  faceProcessWindow.send("SET_AUTO_DARKNESS_CONTROL", payload);
});
ipcMain.on("SET_STRETCH_GUIDE", (evt, payload) => {
  setting.stretchGuideScreen.isStretchGuideOn = payload;
  faceProcessWindow.send("SET_STRETCH_GUIDE",payload);
});
ipcMain.on("SET_BRIGHT_WARNING", (evt, payload) => {
  setting.faceProcess.isBrightWarningOn = payload;
  faceProcessWindow.send("SET_BRIGHT_WARNING", payload);
});
// minimize, maximize, close
ipcMain.on("MINIMIZE", (evt, payload) => {
  switch (payload) {
    case "settingPage": {
      settingWindow.minimize();
    }
  }
});
ipcMain.on("MAXIMIZE", (evt, payload) => {
  switch (payload) {
    case "settingPage": {
      if (settingWindow.isMaximized()) {
        settingWindow.unmaximize();
      } else {
        settingWindow.maximize();
      }
    }
  }
});
ipcMain.on("CLOSE", (evt, payload) => {
  switch (payload) {
    case "settingPage": {
      settingWindow.close();
    }
  }
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
