import { app, BrowserWindow, Menu, Tray,nativeImage, ipcRenderer,ipcMain } from 'electron'
import '@tensorflow/tfjs'
import path from 'path'
import fs from 'fs'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}
const setting = JSON.parse(fs.readFileSync('setting.json','utf-8'));
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
        fs.writeFileSync('setting.json',JSON.stringify(setting));
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

//set show stretch_guide
ipcMain.on('SHOW_STRETCH_GUIDE',(evt,payload)=>{
  stretchGuideWindow.show();
  stretchGuideWindow.send('PLAY_STRETCH_GUIDE');
})
ipcMain.on('HIDE_STRETCH_GUIDE',(evt,payload)=>{
  stretchGuideWindow.hide();
})

//set screenFilter
ipcMain.on('SET_FILTER_SHOW',(evt,payload)=>{
  setting.screenFilter.show=payload;
  ScreenFilterWindow.send('SET_FILTER_SHOW',payload)
})
ipcMain.on('SET_DARKNESS',(evt,payload)=>{
  setting.screenFilter.darkness=payload;
  ScreenFilterWindow.send('SET_DARKNESS',payload)
})
ipcMain.on('SET_BLUELIGHTFIGURE',(evt,payload)=>{
  setting.screenFilter.blueLightFigure=payload;
  ScreenFilterWindow.send('SET_BLUELIGHTFIGURE',payload)
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
  setting.warningMessage.show=payload;
  warningMessageWindow.send('SET_WARNING_DURATION',payload)
})

//opencv4nodejs로 사진 띄우는 예제
// const cv = require('opencv4nodejs');
// try {
//   const image = cv.imread(path.resolve('static','images/test.jpg'));
//   cv.imshowWait('Image', image);
// }
// catch(err){
//   console.log('err',err);
// }

// camera 모듈 사용 예제
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