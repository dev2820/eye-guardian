<template>
    <div id="face-process">
        <canvas id="inputCanvas" style="display:none"></canvas>
        <video id="inputVideo" autoplay loop></video>
        <div>{{detectFace}}</div>
    </div>
</template>

<script>
import * as faceapi from 'face-api.js';
faceapi.env.monkeyPatch({
    Canvas: HTMLCanvasElement,
    Image: HTMLImageElement,
    ImageData: ImageData,
    Video: HTMLVideoElement,
    createCanvasElement: () => document.createElement('canvas'),
    createImageElement: () => document.createElement('img')
});
import { mapState } from 'vuex'
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
            this.showVideo();
        })
    },
    computed: {
        ...mapState({
            isScreenFilterOn: state=>state.ScreenFilter.show,
        })
    },
    methods:{
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
                
                setTimeout( draw, 100 );
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