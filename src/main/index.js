import { app, BrowserWindow, Menu, Tray } from 'electron'
import '../renderer/store'
import path from 'path'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let settingWindow,blueScreenWindow,warningMessageWindow
let tray = null
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  settingWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
  })
  settingWindow.loadURL(winURL)

  blueScreenWindow = new BrowserWindow({
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
  blueScreenWindow.loadURL(winURL+'/#/blueScreen')
  blueScreenWindow.setIgnoreMouseEvents(true);

  warningMessageWindow = new BrowserWindow({
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
  warningMessageWindow.loadURL(winURL+'/#/warningMessage')
  warningMessageWindow.setIgnoreMouseEvents(true);

  tray = new Tray(path.join(__dirname,'/assets/images/icon.ico'));
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
        blueScreenWindow.destroy();
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
  blueScreenWindow.on('closed',()=>{
    blueScreenWindow = null;
  })
}
setTimeout(()=>{
  settingWindow.send('BLUESCREEN_CONTROL',true);//블루스크린을 켜는 ipc 통신
},5000);
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
