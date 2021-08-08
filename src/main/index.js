import { app, BrowserWindow, Menu, Tray,nativeImage, ipcRenderer,ipcMain } from 'electron'
import '../renderer/store'
import '@tensorflow/tfjs'
import path from 'path'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let settingWindow,ScreenFilterWindow,warningMessageWindow,faceProcessWindow,stretchGuideWindow
let tray = null
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`;

function createWindow () {
  settingWindow = new BrowserWindow({//설정 화면
    webPreferences: { nodeIntegration: true },
    height: 563,
    useContentSize: true,
    width: 1000,
  })
  settingWindow.loadURL(winURL)

  ScreenFilterWindow = new BrowserWindow({//필터(블루라이트,명암 등)
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

  warningMessageWindow = new BrowserWindow({//경고 화면
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

  faceProcessWindow = new BrowserWindow({//웹캠 관련 처리가 동작하는 화면
    webPreferences: { nodeIntegration: true },
    useContentSize: true,
    show:true//추후 안보이게 변경할 예정
  })
  
  if(process.env.NODE_ENV === 'development') {
    faceProcessWindow.loadURL(winURL+'/#/faceProcess')
  }
  else {
    faceProcessWindow.loadURL(winURL+'#faceProcess')
  }
  
  stretchGuideWindow = new BrowserWindow({//스트레칭화면
    webPreferences: { nodeIntegration: true },
    useContentSize: true,
    frame:false,
    // alwaysOnTop :true,
    transparent:true,
    webPreferences: {
      devTools: false
    },
    show:false
  })
  
  if(process.env.NODE_ENV === 'development') {
    stretchGuideWindow.loadURL(winURL+'/#/stretchGuideScreen')
  }
  else {
    stretchGuideWindow.loadURL(winURL+'#stretchGuideScreen')
  }
  tray = new Tray(path.join(__static,'/images/icon.ico'));//작업 관리자 요소
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
  
  settingWindow.on('close', (e) => {//설정 화면을 꺼도 꺼지지 않게 함
    e.preventDefault();
    settingWindow.hide();
  })
  settingWindow.on('closed',()=>{
    settingWindow = null;
  })
  ScreenFilterWindow.on('closed',()=>{
    ScreenFilterWindow = null;
  })
  warningMessageWindow.on('closed',()=>{
    warningMessageWindow = null;
  })
  faceProcessWindow.on('closed',()=>{
    faceProcessWindow = null;
  })
  stretchGuideWindow.on('closed',()=>{
    stretchGuideWindow = null;
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

// ipcMain.on('BRIGHT',(evt,payload)=>{
//   const py = exec('py bright/main.py --input_path snapshot/0image.jpeg',(err,stdout,stderr)=>{
//     if(stderr) {
//       console.error(stderr)
//     }
//     console.log(stdout)
//   })
// })

// ipcMain.on('START',(evt,payload)=>{
//   console.log(evt,payload,'START')
// })
let count=0;
// // let ready=0;
// const webcam = camera.createStream()
// webcam.on('data', async (buffer) => {
//     if(count>120){
//       webcam.destroy();
//     }
//     else {
//       // settingWindow.send('FACE_BUFFER',buffer.toString('base64'));//블루스크린을 켜는 ipc 통신
//       fs.writeFileSync(`snapshot/${count}image.jpeg`,buffer);
//       count++;
//       const py = exec('py bright/main.py --input_path snapshot/0image.jpeg',(err,stdout,stderr)=>{
//         if(stderr) {
//           console.error(stderr)
//         }
//         console.log(stdout)
//         // settingWindow.send('FACE_BUFFER',buffer.toString('base64'));//블루스크린을 켜는 ipc 통신
//       })
//     }
// });
//   // 
//   // console.log(detections)
// })
ipcMain.on('READY',(evt,payload)=>{
  // console.log(evt,payload,'READY');
  faceProcessWindow.send('FACE_DETECT_START',true)
})
ipcMain.on('MESSAGE',(evt,payload)=>{
  console.log(evt,payload)
  faceProcessWindow.send('MESSAGE2',2)
})
ipcMain.on('SHOW_STRETCH_GUIDE',(evt,payload)=>{
  stretchGuideWindow.show();
  stretchGuideWindow.send('PLAY_STRETCH_GUIDE');
})
ipcMain.on('HIDE_STRETCH_GUIDE',(evt,payload)=>{
  stretchGuideWindow.hide();
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
