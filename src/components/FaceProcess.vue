<template>
    <div id="face-process">
        <canvas id="inputCanvas" style="display:none"></canvas>
        <video id="inputVideo" autoplay playsinline></video>
        <div>{{detectFace}}</div>
        <div id="detect-box"></div>
    
        <div id="main">
            <div class="container">
                <div class="canvas-wrapper">
                    <canvas id="output"></canvas>
                    <video id="video" playsinline style="
                -webkit-transform: scaleX(-1);
                transform: scaleX(-1);
                visibility: hidden;
                width: auto;
                height: auto;
                ">
                    </video>
                </div>
                <div id="scatter-gl-container"></div>
            </div>
        </div>
    </div>
    
</template>


<script>

import * as faceapi from 'face-api.js';
import { ipcRenderer as ipc } from 'electron'
// import * as posenet from '@tensorflow-models/posenet'
// import tf from '@tensorflow/tfjs';
// import { exec } from 'child_process'
// import fs from 'fs'
import path from 'path'
// import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-backend-cpu';

// import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
// import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
// import * as tf from '@tensorflow/tfjs-core';
// import Stats from '../assets/stats.js';
// import {TRIANGULATION} from '../assets/triangulation';
// import * as test from 'facedetector.js'

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
            
            videoEl.addEventListener('play', ()=>{
                ipc.on('SAVE_DISTANCE', saveDistance)
                draw();
                bright();
                eyeblink();
                // sitted();
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
                // console.log(img.src)
                this.detectFace = detections?detections.classScore : 'no face'
                setTimeout( draw, 1000 );//10~30프레임 0.06초마다 얼굴을 감지한다.
            }
           
// /********************************************************** */
//             let eyeblink = async () => {                     //눈 깜빡임 감지 로직 
//            tfjsWasm.setWasmPaths(
//     `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${
//         tfjsWasm.version_wasm}/dist/`);

// const NUM_KEYPOINTS = 468;
// const NUM_IRIS_KEYPOINTS = 5;
// const GREEN = '#32EEDB';
// const RED = '#FF2C35';
// const BLUE = '#157AB3';
// let stopRendering = false;

// function isMobile() {
//   const isAndroid = /Android/i.test(navigator.userAgent);
//   const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
//   return isAndroid || isiOS;
// }

// function distanceT(a, b) {
//   return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
// }

// function drawPath(ctx, points, closePath) {
//   const region = new Path2D();
//   region.moveTo(points[0][0], points[0][1]);
//   for (let i = 1; i < points.length; i++) {
//     const point = points[i];
//     region.lineTo(point[0], point[1]);
//   }

//   if (closePath) {
//     region.closePath();
//   }
//   ctx.stroke(region);
// }

// let model, ctx, videoWidth, videoHeight, video, canvas,
//     scatterGLHasInitialized = false, scatterGL, rafID;

// const VIDEO_SIZE = 500;
// const mobile = isMobile();
// // Don't render the point cloud on mobile in order to maximize performance and
// // to avoid crowding limited screen space.
// const renderPointcloud = mobile === false;
// const stats = new Stats();
// const state = {
//   backend: 'webgl',
//   maxFaces: 1,
//   triangulateMesh: true,
//   predictIrises: true
// };

// if (renderPointcloud) {
//   state.renderPointcloud = true;
// }

// function setupDatGui() {
//   const gui = new dat.GUI();
//   gui.add(state, 'backend', ['webgl', 'wasm', 'cpu'])
//       .onChange(async backend => {
//         window.cancelAnimationFrame(rafID);
//         await tf.setBackend(backend);
//         requestAnimationFrame(renderPrediction);
//       });

//   gui.add(state, 'maxFaces', 1, 20, 1).onChange(async val => {
//     model = await faceLandmarksDetection.load(
//       faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
//       {maxFaces: val});
//   });

//   gui.add(state, 'triangulateMesh');
//   gui.add(state, 'predictIrises');

//   if (renderPointcloud) {
//     gui.add(state, 'renderPointcloud').onChange(render => {
//       document.querySelector('#scatter-gl-container').style.display =
//           render ? 'inline-block' : 'none';
//     });
//   }
// }

// async function setupCamera() {
//   video = document.getElementById('video');

//   const stream = await navigator.mediaDevices.getUserMedia({
//     'audio': false,
//     'video': {
//       facingMode: 'user',
//       // Only setting the video to a specified size in order to accommodate a
//       // point cloud, so on mobile devices accept the default size.
//       width: mobile ? undefined : VIDEO_SIZE,
//       height: mobile ? undefined : VIDEO_SIZE
//     },
//   });
//   video.srcObject = stream;

//   return new Promise((resolve) => {
//     video.onloadedmetadata = () => {
//       resolve(video);
//     };
//   });
// }

// async function renderPrediction() {
//   if (stopRendering) {
//     return;
//   }

//   stats.begin();

//   const predictions = await model.estimateFaces({
//     input: video,
//     returnTensors: false,
//     flipHorizontal: false,
//     predictIrises: state.predictIrises
//   });
//   ctx.drawImage(
//       video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);

//   if (predictions.length > 0) {
//     predictions.forEach(prediction => {
//       const keypoints = prediction.scaledMesh;

//       if (state.triangulateMesh) {
//         ctx.strokeStyle = GREEN;
//         ctx.lineWidth = 0.5;

//         for (let i = 0; i < TRIANGULATION.length / 3; i++) {
//           const points = [
//             TRIANGULATION[i * 3], TRIANGULATION[i * 3 + 1],
//             TRIANGULATION[i * 3 + 2]
//           ].map(index => keypoints[index]);

//           drawPath(ctx, points, true);
//         }
//       } else {
//         ctx.fillStyle = GREEN;

//         for (let i = 0; i < NUM_KEYPOINTS; i++) {
//           const x = keypoints[i][0];
//           const y = keypoints[i][1];

//           ctx.beginPath();
//           ctx.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
//           ctx.fill();
//         }
//       }

//       if (keypoints.length > NUM_KEYPOINTS) {
//         ctx.strokeStyle = RED;
//         ctx.lineWidth = 1;

//         const leftCenter = keypoints[NUM_KEYPOINTS];
//         const leftDiameterY = distanceT(
//             keypoints[NUM_KEYPOINTS + 4], keypoints[NUM_KEYPOINTS + 2]);
//         const leftDiameterX = distanceT(
//             keypoints[NUM_KEYPOINTS + 3], keypoints[NUM_KEYPOINTS + 1]);

//         ctx.beginPath();
//         ctx.ellipse(
//             leftCenter[0], leftCenter[1], leftDiameterX / 2, leftDiameterY / 2,
//             0, 0, 2 * Math.PI);
//         ctx.stroke();

//         if (keypoints.length > NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS) {
//           const rightCenter = keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS];
//           const rightDiameterY = distanceT(
//               keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 2],
//               keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 4]);
//           const rightDiameterX = distanceT(
//               keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 3],
//               keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 1]);

//           ctx.beginPath();
//           ctx.ellipse(
//               rightCenter[0], rightCenter[1], rightDiameterX / 2,
//               rightDiameterY / 2, 0, 0, 2 * Math.PI);
//           ctx.stroke();
//         }
//       }
//     });

//     if (renderPointcloud && state.renderPointcloud && scatterGL != null) {
//       const pointsData = predictions.map(prediction => {
//         let scaledMesh = prediction.scaledMesh;
//         return scaledMesh.map(point => ([-point[0], -point[1], -point[2]]));
//       });

//       let flattenedPointsData = [];
//       for (let i = 0; i < pointsData.length; i++) {
//         flattenedPointsData = flattenedPointsData.concat(pointsData[i]);
//       }
//       const dataset = new ScatterGL.Dataset(flattenedPointsData);

//       if (!scatterGLHasInitialized) {
//         scatterGL.setPointColorer((i) => {
//           if (i % (NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS * 2) > NUM_KEYPOINTS) {
//             return RED;
//           }
//           return BLUE;
//         });
//         scatterGL.render(dataset);
//       } else {
//         scatterGL.updateDataset(dataset);
//       }
//       scatterGLHasInitialized = true;
//     }
//   }

//   stats.end();
//   rafID = requestAnimationFrame(renderPrediction);
// }

// async function main() {
//   await tf.setBackend(state.backend);
//   setupDatGui();

//   stats.showPanel(0);  // 0: fps, 1: ms, 2: mb, 3+: custom
//   document.getElementById('main').appendChild(stats.dom);

//   await setupCamera();
//   video.play();
//   videoWidth = video.videoWidth;
//   videoHeight = video.videoHeight;
//   video.width = videoWidth;
//   video.height = videoHeight;

//   canvas = document.getElementById('output');
//   canvas.width = videoWidth;
//   canvas.height = videoHeight;
//   const canvasContainer = document.querySelector('.canvas-wrapper');
//   canvasContainer.style = `width: ${videoWidth}px; height: ${videoHeight}px`;

//   ctx = canvas.getContext('2d');
//   ctx.translate(canvas.width, 0);
//   ctx.scale(-1, 1);
//   ctx.fillStyle = GREEN;
//   ctx.strokeStyle = GREEN;
//   ctx.lineWidth = 0.5;

//   model = await faceLandmarksDetection.load(
//       faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
//       {maxFaces: state.maxFaces});
//   renderPrediction();

//   if (renderPointcloud) {
//     document.querySelector('#scatter-gl-container').style =
//         `width: ${VIDEO_SIZE}px; height: ${VIDEO_SIZE}px;`;

//     scatterGL = new ScatterGL(
//         document.querySelector('#scatter-gl-container'),
//         {'rotateOnStart': false, 'selectEnabled': false});
//   }
// }

// main();

// };

// /********************************************************** */

             let bright = async () =>{
                const context = canvas.getContext('2d');
                // context.drawImage(videoEl, 0, 0, 200, 200);
                // const base64String = canvas.toDataURL('image/png');//png형식의 base64 string을 생성한다.
                // const buffer = new Buffer(base64String.toString(),"base64")
                // fs.writeFileSync('bright_file.png',buffer);
                //1. 이미지가 제대로 생성되지 않는다. => 버그 수정해서 bright_file.png로 저장할 것
                //2. 이미지가 제대로 생성된다면 exec로 main.py를 실행해서 이미지의 밝기값을 가져오게 만든다.
                //3. 밝기값에 대한 임계치를 설정해서(ex. 주변이 아주 어두울때 main.py가 1 값을 반환한다면) 아래 코드를 실행해 message를 생성한다. 
                //4. 현재 setTimeout을 통해 밝기 테스트를 5초마다 진행하게 되어있다. 필요에 따라 이 값도 바꿔줄 수 있다.
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
                else if(brightness < 50){
                    this.generateBrightWarning();
                }
                setTimeout( bright, 30*1000 );//30초마다 밝기 테스트하도록 되어있음
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
  .canvas-wrapper,
        #scatter-gl-container {
            display: inline-block;
            vertical-align: top;
        }

        #scatter-gl-container {
            border: solid 1px black;
            position: relative;
        }

        /* center the canvas within its wrapper */
        #scatter-gl-container canvas {
            left: 50%;
            position: absolute;
            top: 50%;
            transform: translate3d(-50%, -50%, 0);
        }
/* div#detect-box {
    position:absolute;
    background:red;
} */
</style>