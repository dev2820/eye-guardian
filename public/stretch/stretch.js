const { ipcRenderer } = require("electron");
let isplay=false;
let isended=false;
const videoEl = document.getElementById('stretchVideo');
const exitButton = document.getElementById('exitButton');
exitButton.addEventListener('click',()=>{
    exitStretch();
    closeStretchGuide();
},false);
videoEl.addEventListener('paused',()=>{//플레이가 끝나면
    closeStretchGuide();
});
videoEl.addEventListener('ended',()=>{//플레이가 끝나면
    closeStretchGuide();
});
ipcRenderer.on('PLAY_STRETCH_GUIDE',()=>{//플레이 시작 message
    videoEl.currentTime = 0;
    videoEl.play();
})
function closeStretchGuide(){
    ipcRenderer.send('HIDE_STRETCH_GUIDE',true);
}
function exitStretch() {
    videoEl.pause();
}