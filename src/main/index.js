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
    height: 563,
    useContentSize: true,
    width: 1000,
  })
  settingWindow.loadURL(winURL)

  ScreenFilterWindow = new BrowserWindow({
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
  ScreenFilterWindow.loadURL(winURL+'/#/screenFilter')
  ScreenFilterWindow.setIgnoreMouseEvents(true);

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
