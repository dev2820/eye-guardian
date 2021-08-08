<template>
    <div id="face-process">
        <canvas id="inputCanvas" style="display:none"></canvas>
        <video id="inputVideo"></video>
        <div>{{detectFace}}</div>
    </div>
</template>

<script>
import * as faceapi from 'face-api.js';
import { ipcRenderer as ipc } from 'electron'
import { exec } from 'child_process'
import fs from 'fs'
import { mapState,mapActions } from 'vuex'

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
            detectFace:'no face'
        }
    },
    mounted(){
        Promise.all([
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
        ]).then(()=>{
            this.showVideo();//웹캠을 실행하며, 웹캠으로부터 받아온 리소스를 처리하는 메소드
            ipc.send('MESSAGE',1);
        })
        ipc.on('MESSAGE2',(evt,payload)=>{
            console.log(evt,payload)
        })
    },
    computed: {
        ...mapState({
            isScreenFilterOn: state=>state.ScreenFilter.show,
            duration: state=>state.WarningMessage.duration,
        })
    },
    methods:{
        ...mapActions(['insertMessage']),
        generateBrightWarning(){
            ipc.send('BRIGHT_WARNING',{type:'bright-warning'})
        },
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
                bright();
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
                
                setTimeout( draw, 60 );//10~30프레임 0.06초마다 얼굴을 감지한다.
            }
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
                else if(brightness < 60){
                    this.generateBrightWarning();
                }
                setTimeout( bright, 30*1000 );//30초마다 밝기 테스트하도록 되어있음
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