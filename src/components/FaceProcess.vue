<template>
    <div id="face-process">
        <canvas id="inputCanvas" style="display:none"></canvas>
        <video id="inputVideo" autoplay playsinline></video>
        <div>{{detectFace}}</div>
        <div id="detect-box"></div>
    </div>
</template>

<script>
import * as faceapi from 'face-api.js';
import { ipcRenderer as ipc } from 'electron'
import * as posenet from '@tensorflow-models/posenet'
import tf from '@tensorflow/tfjs';
// import { exec } from 'child_process'
// import fs from 'fs'
import path from 'path'
faceapi.env.monkeyPatch({
    Canvas: HTMLCanvasElement,
    Image: HTMLImageElement,
    ImageData: ImageData,
    Video: HTMLVideoElement,
    createCanvasElement: () => document.createElement('canvas'),
    createImageElement: () => document.createElement('img')
});
export default {
    name:'face-process',
    data(){
        return {
            detectFace:'no face',
            faceLength:0,
            isAutoDarknessControlOn:false,
            isStretchGuideOn:false,
            isDistanceWarningOn:false,
            isEyeblinkWarningOn:false,
            isSittedWarningOn:false,
        }
    },
    mounted(){
        ipc.send('REQUEST_INIT_SCREEN_VALUE','faceProcess')
        ipc.on('INIT',(evt,payload)=>{
            this.faceLength = parseFloat(payload.faceProcess.faceLength);
            this.isDistanceWarningOn= payload.faceProcess.isDistanceWarningOn;
            this.isEyeblinkWarningOn= payload.faceProcess.isEyeblinkWarningOn;
            this.isSittedWarningOn= payload.faceProcess.isSittedWarningOn;
            this.isAutoDarknessControlOn= payload.faceProcess.isAutoDarknessControlOn;
        })
        ipc.on('ESTIMATE_DISTANCE',()=>{
            ipc.send('INSERT_MESSAGE',{content:'ready-to-capture',type:'normal'})
            setTimeout(
                ()=>this.saveDistance(),
                5*1000
            )
        })
        ipc.on('SET_DISTANCE_WARNING',(evt,payload)=>{
            this.isDistanceWarningOn = payload;
        })
        ipc.on('SET_SITTED_WARNING',(evt,payload)=>{
            this.isSittedWarningOn = payload;
        })
        ipc.on('SET_EYEBLINK_WARNING',(evt,payload)=>{
            this.isEyeblinkWarningOn = payload;
        })
        ipc.on('SET_AUTO_DARKNESS_CONTROL',(evt,payload)=>{
            this.autoDarknessControl = payload;
        })
        ipc.on('SET_STRETCH_GUIDE',(evt,payload)=>{
            this.isStretchGuideOn = payload;
        })
        const dataPath =
            process.env.NODE_ENV === 'development'
                ? "./data"
                : path.join(process.resourcesPath, 'data');
        Promise.all([
            faceapi.nets.faceRecognitionNet.loadFromDisk(dataPath+'/models'),
            faceapi.nets.faceLandmark68Net.loadFromDisk(dataPath+'/models'),
            faceapi.nets.ssdMobilenetv1.loadFromDisk(dataPath+'/models')
        ]).then(()=>{
            this.showVideo();//웹캠을 실행하며, 웹캠으로부터 받아온 리소스를 처리하는 메소드
        }).catch((err)=>{
            console.error(err)
        })
    },
    methods:{
        generateBrightWarning(){
            // ipc.send('INSERT_MESSAGE',{content:'bright-warning',type:'normal'})
            if(this.isAutoDarknessControlOn){//밝기 자동 조절 모드가 켜져있는 경우
                // ipc.send('SET_DARKNESS',0.5);//0~0.5
            }
        },
        generateDistanceWarning(){
            ipc.send('INSERT_MESSAGE',{content:'distance-warning',type:'warning'})
        },
        async saveDistance() {
            const videoEl = document.getElementById('inputVideo')
            const canvas = document.getElementById('inputCanvas')
            const img = this.getImgfromWebcam(videoEl,canvas);

            const detections = await faceapi.detectSingleFace(img);
            if(detections){
                this.faceLength = detections.box.width;
                ipc.send('INSERT_MESSAGE',{content:'capture-face',type:'normal'});
                ipc.send('SET_FACE_DISTANCE',detections.box.width);
            }
            else {
                ipc.send('INSERT_MESSAGE',{content:'no-face',type:'warning'})
            }
        },
        getImgfromWebcam(videoEl,canvas){
            const context = canvas.getContext('2d');
            context.drawImage(videoEl, 0, 0, 300, 150);
            const img = new Image();
            img.src = canvas.toDataURL('image/jpeg');
            return img;
        },
        showVideo(){
            const videoEl = document.getElementById('inputVideo')
            const canvas = document.getElementById('inputCanvas')
            const box = document.getElementById('detect-box')
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
                    ipc.send('LOAD_CAMERA_FAILED',true)
                    console.error(err)
                }
            );
            
            videoEl.addEventListener('play',async ()=>{
                //faceapi가 모델을 불러오고 화면 작동을 시작하는 시점을 settingPage에 알려주기 위한 코드
                const img = this.getImgfromWebcam(videoEl,canvas);
                await faceapi.detectSingleFace(img)
                ipc.send('LOAD_CAMERA_SUCCESS',true)
                // draw();
                // bright();
                // eyeblink();
                sitted();
                screenDistance();
            },false)
            
            let draw = async () => {
                const img = this.getImgfromWebcam(videoEl,canvas);
                const detections = await faceapi.detectSingleFace(img)
                if(detections){
                    box.style.width = 0//detections.box.width+'px';
                    box.style.height = 0//detections.box.height+'px';
                    box.style.top = 0//detections.box.y+'px';
                    box.style.left = 0//detections.box.x+'px';
                }
                this.detectFace = detections?detections.classScore : 'no face'
                setTimeout( draw, 1000 );//10~30프레임 0.06초마다 얼굴을 감지한다.
            }
            
            let bright = async () =>{
                if(this.brightWarningOn) {
                    const context = canvas.getContext('2d');
                    const data= context.getImageData(0,0,canvas.width,canvas.height).data;
                    let r=0,g=0,b=0;
                    for(let x= 0, len= data.length; x < len; x+=4) {
                        r += data[x];
                        g += data[x+1];
                        b += data[x+2];
                    }
                    const colorSum = Math.sqrt(0.299 * (r ** 2)
                        + 0.587 * (g ** 2)
                        + 0.114 * (b ** 2));
                    const brightness= Math.floor(colorSum /(canvas.width*canvas.height));
                    // console.log('brightness',brightness)
                    if(brightness<=0) {
                        //brightness가 0 인경우 에러값으로 치부하고 패스하겠음(처음 값으로 0값이 들어와 무조건 알람이 발생함)
                    }
                    else if( 0 < brightness && brightness < 50){
                        this.generateBrightWarning();
                    }
                }
                setTimeout( bright, 30*1000 );//30초마다 밝기 테스트하도록 되어있음
            }
            // let eyeblink = async () => {
            //     //눈 깜빡임 감지 로직 
            //     //setTimeout( eyeblink, 60 );//10~30프레임 0.06초마다 얼굴을 감지한다.
            // }
            let sitted = async () => {
                //앉아있는지 감지하는 로직
                //setTimeout( sitted, 1000 );//10~30프레임 0.06초마다 얼굴을 감지한다.
                const net = await posenet.load({
                    inputResolution: { width: 300, height: 150 },
                });
                const pose = await net.estimateSinglePose(videoEl, {
                    flipHorizontal:true
                })
                console.log(pose)
            }
            let screenDistance = async () => {
                if(this.distanceWarningOn) {
                    if(this.faceLength !== 0){
                        const img = this.getImgfromWebcam(videoEl,canvas);
                        const detections = await faceapi.detectSingleFace(img)
                        if(detections && (this.faceLength*8)/6 < detections.box.width){
                            this.generateDistanceWarning();
                        }
                    }
                }
                setTimeout( screenDistance, 10*1000 );//10초에 한번 얼굴 감지
            }
        }
    }
}
</script>
<style scoped>
video {
    /* border:2px solid black; */
    width:300px;
    height:150px;
}
div#detect-box {
    position:absolute;
    background:red;
}
</style>