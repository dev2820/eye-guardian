<template>
    <div id="face-process">
        <canvas id="inputCanvas" style="display:none"></canvas>
        <video id="inputVideo" autoplay loop></video>
        <div>{{detectFace}}</div>
    </div>
</template>

<script>
import * as faceapi from 'face-api.js';
import { ipcRenderer as ipc } from 'electron'
import { exec } from 'child_process'

faceapi.env.monkeyPatch({
    Canvas: HTMLCanvasElement,
    Image: HTMLImageElement,
    ImageData: ImageData,
    Video: HTMLVideoElement,
    createCanvasElement: () => document.createElement('canvas'),
    createImageElement: () => document.createElement('img')
});
import fs from 'fs'
import { mapState,mapActions } from 'vuex'
export default {
    name:'face-process',
    data(){
        return {
            detectFace:'no face'
        }
    },
    mounted(){
        Promise.all([
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
        ]).then(()=>{
            // this.showVideo();
            ipc.send('MESSAGE',1);
        })
        ipc.on('MESSAGE2',(evt,payload)=>{
            console.log(evt,payload)
        })
        console.log(exec)
    },
    computed: {
        ...mapState({
            isScreenFilterOn: state=>state.ScreenFilter.show,
        })
    },
    methods:{
        ...mapActions(['insertMessage']),
        showVideo(){
            const videoEl = document.getElementById('inputVideo')
            const canvas = document.getElementById('inputCanvas')
            navigator.getMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetuserMedia ||
            navigator.msGetUserMedia;

            navigator.getMedia(
                { video: {} },
                async (stream) => {
                    videoEl.srcObject = stream;
                    videoEl.play();
                },
                (err) => {
                    console.error(err)
                }
            );
            videoEl.addEventListener('play',()=>{
                draw();
                // bright();
            },false)

            
            let draw = async () => {
                function makeImage(){
                    const context = canvas.getContext('2d');
                    context.drawImage(videoEl, 0, 0, 200, 200);
                    const img = new Image();
                    img.src = canvas.toDataURL('image/jpeg');
                    return img;
                }
                const img = makeImage();
                const detections = await faceapi.detectSingleFace(img)
                this.detectFace = detections?detections.classScore : 'no face'
                
                setTimeout( draw, 60 );//10~30프레임
            }
            let bright = async () =>{
                const context = canvas.getContext('2d');
                context.drawImage(videoEl, 0, 0, 200, 200);
                const base64String = canvas.toDataURL('image/png');
                const buffer = new Buffer(base64String.toString(),"base64")
                fs.writeFileSync('bright_file.png',buffer);
                //exec -> 밝기 테스트해서 값 가져오고
                //message 도 찍어 
                //this.$store.dispatch('insertWarningMessage',{type:'bright-warning',3});
                setTimeout( bright, 5000 );//5초마다 밝기 테스트하도록 되어있음
            }
        }
    }
}
</script>
<style scoped>
video {
    border:2px solid black;
}
</style>