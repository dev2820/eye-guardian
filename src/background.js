'use strict'

import { app, protocol, BrowserWindow, Menu ,Tray ,ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import fs from 'fs'
import path from 'path'
const isDevelopment = process.env.NODE_ENV !== 'production'
// Scheme must be registered before the app is ready
const dataPath =
  process.env.NODE_ENV === 'development'
    ? path.join(__dirname,'../data')
    : path.join(process.resourcesPath, 'data');
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true }, stream: true }
])
let settingWindow=null,
screenFilterWindow=null,
warningMessageWindow=null,
faceProcessWindow=null,
stretchGuideWindow=null;
let tray = null;
const setting = JSON.parse(fs.readFileSync(path.join(dataPath,'setting.json')));

function registerLocalVideoProtocol () {
  protocol.registerFileProtocol('local-video', (request, callback) => {
    const url = request.url.replace(/^local-video:\/\//, '')
    // Decode URL to prevent errors when loading filenames with UTF-8 chars or chars like "#"
    const decodedUrl = decodeURI(url) // Needed in case URL contains spaces
    try {
      // eslint-disable-next-line no-undef
      return callback(path.join(__static, decodedUrl))
    } catch (error) {
      console.error(
        'ERROR: registerLocalVideoProtocol: Could not get file path:',
        error
      )
    }
  })
}

function createWindow(devPath,prodPath,options,isSettingWindow) {
  let window = new BrowserWindow(options)
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    window.loadURL(process.env.WEBPACK_DEV_SERVER_URL + devPath)
    if (!process.env.IS_TEST) window.webContents.openDevTools()
  } else {
    // Load the index.html when not in development
    window.loadURL(`app://./${prodPath}`)
  }
  if(isSettingWindow){
    window.on('close', (e) => {//설정 화면을 꺼도 꺼지지 않게 함
      e.preventDefault();
      window.hide();
    })
  }
  else {
    window.on('closed', () => { window = null })
  }
  return window
}
function createTray(icon) {
  let tray = new Tray(icon);//작업 관리자 요소
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'setting',
      type: 'normal',
      click(){
        settingWindow.show();
      }
    },
    {
      label: 'exit',
      type: 'normal',
      click(){
        fs.writeFileSync(path.join(dataPath,'setting.json'),JSON.stringify(setting));
        screenFilterWindow.close();
        warningMessageWindow.close();
        faceProcessWindow.close();
        stretchGuideWindow.close();
        settingWindow.destroy();
      }
    },
  ]);
  tray.setToolTip('eye-guardian');
  tray.setContextMenu(contextMenu);
  tray.on('double-click',()=>{
    settingWindow.show();
  })
  return tray
}
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  registerLocalVideoProtocol()
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  if (!process.env.WEBPACK_DEV_SERVER_URL) {
    createProtocol('app')
  }
  settingWindow = createWindow('','index.html',{
    width: 800, 
    height: 600,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  },true)

  warningMessageWindow = createWindow('/#/warningMessage','index.html#warningMessage',{
    webPreferences: { 
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      devTools: false
    },
    fullscreen:true,
    frame:false,
    transparent:true,
    // alwaysOnTop :true,
    focusable:false,
    resizable:false,
  },false)
  warningMessageWindow.setIgnoreMouseEvents(true);
  warningMessageWindow.setAlwaysOnTop(true,"normal")

  screenFilterWindow = createWindow('/#/screenFilter','index.html#screenFilter',{
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      devTools: false
    },
    fullscreen:true,
    frame:false,
    transparent:true,
    // alwaysOnTop :true,
    focusable:false,
    resizable:false,
  },false)
  screenFilterWindow.setIgnoreMouseEvents(true);
  screenFilterWindow.setAlwaysOnTop(true,"normal")

  stretchGuideWindow = createWindow('/#/stretchGuideScreen','index.html#stretchGuideScreen',{
    webPreferences: { 
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      webSecurity: true,
      devTools: false
    },
    useContentSize: true,
    frame:false,
    show:false
  },false)

  faceProcessWindow = createWindow('/#/faceProcess','index.html#faceProcess',{
    webPreferences: { 
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
    },
    useContentSize: true,
    show:true//추후 안보이게 변경할 예정
  },false)
  tray = createTray(path.join(__static,'/images/icon.ico'));
})

ipcMain.on('REQUEST_INIT_SCREEN_VALUE',(evt,payload)=>{
  switch(payload) {
    case 'settingPage': {
      settingWindow.send('INIT',setting);
      break;
    }
    case 'screenFilter': {
      screenFilterWindow.send('INIT',setting);
      break;
    }
    case 'warningMessage': {
      warningMessageWindow.send('INIT',setting);
      break;
    }
    case 'faceProcess': {
      faceProcessWindow.send('INIT',setting);
      break;
    }
    case 'stretchGuide': {
      stretchGuideWindow.send('INIT',setting);
      break;
    }
  }
})

//set show stretch_guide
ipcMain.on('SHOW_STRETCH_GUIDE',(evt,payload)=>{
  stretchGuideWindow.show();
  stretchGuideWindow.send('PLAY_STRETCH_GUIDE');
})
ipcMain.on('HIDE_STRETCH_GUIDE',(evt,payload)=>{
  stretchGuideWindow.hide();
})
ipcMain.on('FACEAPI_READY',()=>{
  faceProcessWindow.send('FACEAPI_CONFIRM',1)
})
//set screenFilter
ipcMain.on('SET_FILTER_SHOW',(evt,payload)=>{
  setting.screenFilter.show=payload;
  screenFilterWindow.send('SET_FILTER_SHOW',payload)
})
ipcMain.on('SET_DARKNESS',(evt,payload)=>{
  setting.screenFilter.darkness=payload;
  screenFilterWindow.send('SET_DARKNESS',payload)
})
ipcMain.on('SET_BLUELIGHTFIGURE',(evt,payload)=>{
  setting.screenFilter.blueLightFigure=payload;
  screenFilterWindow.send('SET_BLUELIGHTFIGURE',payload)
})

//set warningMessage
ipcMain.on('SET_WARNING_MODE',(evt,payload)=>{
  setting.warningMessage.mode=payload;
  warningMessageWindow.send('SET_WARNING_MODE',payload)
})
ipcMain.on('INSERT_MESSAGE',(evt,payload)=>{
  warningMessageWindow.send('INSERT_MESSAGE',payload)
})
ipcMain.on('SET_WARNING_DURATION',(evt,payload)=>{
  setting.warningMessage.duration=payload;
  warningMessageWindow.send('SET_WARNING_DURATION',payload)
})

ipcMain.on('SAVE_DISTANCE',(evt,payload)=>{
  faceProcessWindow.send('SAVE_DISTANCE')
})
// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
