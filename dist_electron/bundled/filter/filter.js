const { ipcRenderer } = require("electron");
let isBlueLightFilterOn= false;
let blueLightFigure= 0;
let darkness= 0;
ipcRenderer.send('REQUEST_INIT_SCREEN_VALUE','screenFilter');
ipcRenderer.on('INIT',(evt,payload)=>{
    isBlueLightFilterOn = payload.screenFilter.isBlueLightFilterOn;
    blueLightFigure = payload.screenFilter.blueLightFigure;
    darkness = payload.screenFilter.darkness;
    setBlueLightFilterOn(isBlueLightFilterOn);
    setBlueLightFigure(blueLightFigure);
    setDarkness(darkness);
});
ipcRenderer.on('SET_BLUELIGHT_FILTER_SHOW',(evt,payload)=>{
    isBlueLightFilterOn = payload;
    setBlueLightFilterOn(payload);
});
ipcRenderer.on('SET_BLUELIGHT_FIGURE',(evt,payload)=>{
    blueLightFigure = payload;
    setBlueLightFigure(payload);
});
ipcRenderer.on('SET_DARKNESS',(evt,payload)=>{
    darkness = payload;
    setDarkness(payload);
});
function setBlueLightFilterOn(boolean) {
    if(boolean){
        document.getElementById('blue-light').classList.remove('hidden');
    }
    else {
        document.getElementById('blue-light').classList.add('hidden');
    }
    
}
function setBlueLightFigure(value) {
    document.getElementById('blue-light').style.background=`rgba(240,127,0,${value})`;
}
function setDarkness(value) {
    document.getElementById('darkness').style.background=`rgba(0,0,0,${value})`;
}