const { ipcRenderer } = require('electron')
ipcRenderer.send('INSERT_MESSAGE',{content:'distance-warning',type:'warning'})
const videoEl = document.getElementById('inputVideo')
navigator.getMedia = navigator.getUserMedia ||
                     navigator.webkitGetUserMedia ||
                     navigator.mozGetuserMedia ||
                     navigator.msGetUserMedia;
navigator.getMedia(
    { video: true },
    async (stream) => {
        videoEl.srcObject = stream;
        videoEl.play();
    },
    (err) => {
        ipcRenderer.send('LOAD_CAMERA_FAILED',true)
        console.error(err)
    }
);

videoEl.addEventListener('play',async ()=>{
    //faceapi가 모델을 불러오고 화면 작동을 시작하는 시점을 settingPage에 알려주기 위한 코드
    const videoEl = document.getElementById('inputVideo');
    posenet.load().then(function(net) {
        const pose = net.estimateSinglePose(videoEl,{
            flipHorizontal:true
        });
        return pose;
    }).then(function(pose){
        console.log(pose);
    })
},false)