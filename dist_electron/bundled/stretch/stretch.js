const { ipcRenderer } = require("electron");
let isplay=false;
let isended=false;
const videoEl = document.getElementById('stretchVideo');
videoEl.addEventListener('play',()=>{
    // isplay=true;
})
videoEl.addEventListener('ended',()=>{//플레이가 끝나면
    // isended=true;
    closeStretchGuide();
});
ipcRenderer.on('PLAY_STRETCH_GUIDE',()=>{//플레이 시작 message
    videoEl.play();
})
function closeStretchGuide(){
    ipcRenderer.send('HIDE_STRETCH_GUIDE',true);
}