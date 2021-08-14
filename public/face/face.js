const { ipcRenderer } = require('electron')
const path = require('path');
let net;
require('@tensorflow-models/posenet').load({
    inputResolution: { width: 300, height: 150 },
}).then((value)=>{
    net = value;
});

const NOSE = 0;
const LEFTEYE = 1;
const RIGHTEYE = 2;
const LEFTEAR = 3;
const RIGHTEAR = 4;
const LEFTSHOULDER = 5;
const RIGHTSHOULDER = 6
const LEFTELBOW = 7;
const RIGHTELBOW = 8;
const LEFTWRIST = 9;
const RIGHTWRIST = 10;
const LEFTHIP = 11;
const RIGHTHIP = 12;
const LEFTKNEE = 13;
const RIGHTKNEE = 14;
const LEFTANKLE = 15;
const RIGHTANKLE = 16;

let detectFace='no face';
let faceLength=0;
let isAutoDarknessControlOn=false;
let isStretchGuideOn=false;
let isDistanceWarningOn=false;
let isEyeblinkWarningOn=false;
let isSittedWarningOn=false;
let sittingHeight = 0;
let sitCount=0;

const videoEl = document.getElementById('inputVideo');
const canvasEl = document.getElementById('inputCanvas');
ipcRenderer.send('REQUEST_INIT_SCREEN_VALUE','faceProcess')
ipcRenderer.on('INIT',(evt,payload)=>{
    faceLength = parseFloat(payload.faceProcess.faceLength);
    isDistanceWarningOn= payload.faceProcess.isDistanceWarningOn;
    isEyeblinkWarningOn= payload.faceProcess.isEyeblinkWarningOn;
    isSittedWarningOn= payload.faceProcess.isSittedWarningOn;
    isAutoDarknessControlOn= payload.faceProcess.isAutoDarknessControlOn;
})
ipcRenderer.on('ESTIMATE_DISTANCE',()=>{
    ipcRenderer.send('INSERT_MESSAGE',{content:'ready-to-capture',type:'normal'})
    setTimeout(
        ()=>saveDistance(),
        5*1000
    )
})
ipcRenderer.on('SET_DISTANCE_WARNING',(evt,payload)=>{
    isDistanceWarningOn = payload;
})
ipcRenderer.on('SET_SITTED_WARNING',(evt,payload)=>{
    isSittedWarningOn = payload;
})
ipcRenderer.on('SET_EYEBLINK_WARNING',(evt,payload)=>{
    isEyeblinkWarningOn = payload;
})
ipcRenderer.on('SET_AUTO_DARKNESS_CONTROL',(evt,payload)=>{
    isAutoDarknessControlOn = payload;
})
ipcRenderer.on('SET_STRETCH_GUIDE',(evt,payload)=>{
    isStretchGuideOn = payload;
})

function loadCamera(){
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
}

videoEl.addEventListener('play',async ()=>{
    ipcRenderer.send('LOAD_CAMERA_SUCCESS',true)

    bright();
    // eyeblink();
    sitted();
    screenDistance();
},false)

function generateBrightWarning(){
    // ipcRenderer.send('INSERT_MESSAGE',{content:'bright-warning',type:'normal'})
    if(isAutoDarknessControlOn){//밝기 자동 조절 모드가 켜져있는 경우
        // ipcRenderer.send('SET_DARKNESS',0.5);//0~0.5
    }
}

function generateSitWarning(){
    ipcRenderer.send('INSERT_MESSAGE',{content:'sit-up-time',type:'warning'})
}

function generateDistanceWarning(){
    ipcRenderer.send('INSERT_MESSAGE',{content:'distance-warning',type:'warning'})
}


async function saveDistance() {
    const pose = await net.estimateSinglePose(videoEl, {
        flipHorizontal:true
    })
    if(pose){
        faceLength = pose.keypoints[2].position.x - pose.keypoints[1].position.x;
        sittingHeight = pose.keypoints[0].position.y;
        ipcRenderer.send('INSERT_MESSAGE',{content:'capture-face',type:'normal'});
        ipcRenderer.send('SET_FACE_DISTANCE',faceLength);
    }
    else {
        ipcRenderer.send('INSERT_MESSAGE',{content:'no-face',type:'warning'})
    }
}

function getImgfromWebcam(videoEl,canvasEl){
    const context = canvasEl.getContext('2d');
    context.drawImage(videoEl, 0, 0, 300, 150);
    const img = new Image();
    img.src = canvasEl.toDataURL('image/jpeg');
    return img;
}

async function draw(){
    const pose = await net.estimateSinglePose(videoEl, {
        flipHorizontal:true
    })
    if(pose){
        box.style.width = (pose.keypoints[4].position.x - pose.keypoints[3].position.x) +'px';
        box.style.height = 10+'px';
        box.style.top = pose.keypoints[3].position.y+'px';
        box.style.left = pose.keypoints[3].position.x+'px';
    }
    detectFace = pose?pose.score : 'no face'
    setTimeout( draw, 1000 );//10~30프레임 0.06초마다 얼굴을 감지한다.
}

async function bright() {
    const context = canvasEl.getContext('2d');
    context.drawImage(videoEl, 0, 0, 300, 150);
    const data= context.getImageData(0,0,canvasEl.width,canvasEl.height).data;
    let r=0,g=0,b=0;
    for(let x= 0, len= data.length; x < len; x+=4) {
        r += data[x];
        g += data[x+1];
        b += data[x+2];
    }
    const colorSum = Math.sqrt(0.299 * (r ** 2)
    + 0.587 * (g ** 2)
    + 0.114 * (b ** 2));
    const brightness= Math.floor(colorSum /(canvasEl.width*canvasEl.height));

    // console.log('brightness',brightness)
    if(brightness<=0) {
        //brightness가 0 인경우 에러값으로 치부하고 패스하겠음(처음 값으로 0값이 들어와 무조건 알람이 발생함)
    }
    else if( 0 < brightness && brightness < 50){
        this.generateBrightWarning();
    }
    setTimeout( bright, 30*1000 );//30초마다 밝기 테스트하도록 되어있음
}

async function eyeblink() {
    if(isEyeblinkWarningOn){

    }
    //눈 깜빡임 감지 로직 
    //setTimeout( eyeblink, 60 );//10~30프레임 0.06초마다 얼굴을 감지한다.
}

async function sitted() {
    if(isSittedWarningOn && sittingHeight){//isStretchGuideOn
        //앉아있는지 감지하는 로직
        const pose = await net.estimateSinglePose(videoEl, {
            flipHorizontal:true
        })
        if(pose){
            if(pose.keypoints[0].position.y < sittingHeight - faceLength*2 )
                sitCount = 0;
            else
                sitCount++;
                
            console.log(sitCount, sittingHeight, pose.keypoints[0].position.y)
        }
    }
    if(sitCount == 10)
        generateSitWarning();
    setTimeout( sitted, 1000 );//10~30프레임 0.06초마다 얼굴을 감지한다.
}

async function screenDistance() {
    if(isDistanceWarningOn) {
        if(faceLength !== 0){
            const pose = await net.estimateSinglePose(videoEl, {
                flipHorizontal:true
            })
            if(pose && (faceLength*8)/6 < pose.keypoints[2].position.x - pose.keypoints[1].position.x){
                generateDistanceWarning();
            }
        }
    }
    setTimeout( screenDistance, 10*1000 );//10초에 한번 얼굴 감지
}

loadCamera();