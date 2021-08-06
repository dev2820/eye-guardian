import { app, BrowserWindow, Menu, Tray,nativeImage, ipcRenderer,ipcMain } from 'electron'
import '../renderer/store'
import camera from 'camera'
import * as faceapi from 'face-api.js';
import '@tensorflow/tfjs'
import fs from 'fs';
import path from 'path'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let settingWindow,ScreenFilterWindow,warningMessageWindow
let tray = null
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`;

function createWindow () {
  /**
   * Initial window options
   */
  settingWindow = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    height: 563,
    useContentSize: true,
    width: 1000,
  })
  settingWindow.loadURL(winURL)

  ScreenFilterWindow = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    fullscreen:true,
    frame:false,
    transparent:true,
    alwaysOnTop :true,
    focusable:false,
    resizable:false,
    webPreferences: {
      devTools: false
    },
  })
  if(process.env.NODE_ENV === 'development') {
    ScreenFilterWindow.loadURL(winURL+'/#/screenFilter')
  }
  else {
    ScreenFilterWindow.loadURL(winURL+'#screenFilter')
  }
  ScreenFilterWindow.setIgnoreMouseEvents(true);
  warningMessageWindow = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    fullscreen:true,
    frame:false,
    transparent:true,
    alwaysOnTop :true,
    focusable:false,
    resizable:false,
    webPreferences: {
      devTools: false
    },
  })
  
  if(process.env.NODE_ENV === 'development') {
    warningMessageWindow.loadURL(winURL+'/#/warningMessage')
  }
  else {
    warningMessageWindow.loadURL(winURL+'#warningMessage')
  }
  warningMessageWindow.setIgnoreMouseEvents(true);

  tray = new Tray(path.join(__static,'/images/icon.ico'));
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
        ScreenFilterWindow.close();
        warningMessageWindow.close();
        settingWindow.destroy();
      }
    },
  ]);
  tray.setToolTip('eye-guardian');
  tray.setContextMenu(contextMenu);
  tray.on('double-click',()=>{
    settingWindow.show();
  })
  
  settingWindow.on('close', (e) => {
    e.preventDefault();
    settingWindow.hide();
  })
  settingWindow.on('closed',()=>{
    settingWindow = null
  })
  ScreenFilterWindow.on('closed',()=>{
    ScreenFilterWindow = null;
  })
}
// setTimeout(()=>{
//   settingWindow.send('SCREEN_FILTER_CONTROL',true);//블루스크린을 켜는 ipc 통신
// },5000);
// setTimeout(()=>{
//   settingWindow.send('SCREEN_FILTER_CONTROL',true);//블루스크린을 켜는 ipc 통신
// },5000);
app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (settingWindow === null) {
    createWindow()
  }
})
ipcMain.on('START',(evt,payload)=>{
  console.log(evt,payload,'START')
})
let count=0;
let ready=0;
const webcam = camera.createStream()
webcam.on('data', async (buffer) => {
  if(ready==1){
    if(count>120){
      webcam.destroy();
    }
    else {
      settingWindow.send('FACE_BUFFER',buffer.toString('base64'));//블루스크린을 켜는 ipc 통신
      count++;
    }
  }
  // 
  // console.log(detections)
})
ipcMain.on('READY',(evt,payload)=>{
  // console.log(evt,payload,'READY');
  ready=1;
})

// const cv = require('opencv4nodejs');
// try {
//   const image = cv.imread(path.resolve('static','images/test.jpg'));
//   cv.imshowWait('Image', image);
// }
// catch(err){
//   console.log('err',err);
// }

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
