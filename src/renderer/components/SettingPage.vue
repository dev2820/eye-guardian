<template>
    <div>
        <h2>setting page</h2>
        <span>{{main}}</span>
        <button @click="increase">state increase</button>
        <button @click="decrease">state decrease</button>
        <hr/>
        {{isScreenFilterOn}}
        <button @click="showScreenFilter(true)">screen filter on</button>
        <button @click="showScreenFilter(false)">screen filter off</button>
        <hr/>
        <button @click="changeMessageMode('regular-top')">regular-top</button>
        <button @click="changeMessageMode('regular-bottom')">regular-bottom</button>
        <button @click="changeMessageMode('mini')">mini</button>
        <hr/>
        <button @click="insertMessage('eye-blink')">insert message</button>
        <button @click="insertMessage('too-close')">insert message2</button>
        <button @click="clearMessage('eye-blink')">clear message</button>
        <hr/>
        <font-awesome-icon icon="question-circle" class="icon" @mouseenter="showGuideText($event,'guide1')" @mouseleave="hideGuidText()"/>
        <tooltip :show="showGuide" :position="guidePosition">{{guideText}}</tooltip>
        <hr/>
        <font-awesome-icon icon="question-circle" class="icon" @mouseenter="showGuideText($event,'guide1')" @mouseleave="hideGuidText()"/>
        blueLight 설정<input type="range" :value="blueLightFigure" @change="setBlueLightFigure($event)" min="0" max="0.5" step="0.01">
        <hr/>
        화면 명도 설정<input type="range" :value="darkness" @change="setDarkness($event)" min="0" max="0.5" step="0.01">
        <canvas id="inputCanvas" width="320" height="240" style="display:none"></canvas>
        <video id="inputVideo" autoplay loop></video>
        <video id="cam" autoplay muted playsinline></video>
        <img id="snapshot"/>
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
        Promise.all([
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
        ]).then(()=>{
            ipc.send('READY',1);
        })
import { ipcRenderer as ipc } from 'electron'
import { mapState,mapMutations,mapActions } from 'vuex'
import Tooltip from './Tooltip.vue'
export default {
    data(){
        return {
            guideText:'',
            showGuide:false,
            guidePosition: {
                top:0,
                left:0
            },
            darknessModel:0,
            blueLightFigureModel:0
        }
    },
    components: { 
        Tooltip 
    },
    mounted(){
        ipc.on('SCREEN_FILTER_CONTROL',(e,payload)=>{
            this.showScreenFilter(payload);
        })
        ipc.on('FACE_BUFFER',async (e,payload)=>{
            const image = new Image();
            image.src = 'data:image/jpeg;base64, '+payload;
            const detections = await faceapi.detectSingleFace(image)
            // .withFaceLandmarks().withFaceDescriptors()
            // this.$el.appendChild(image)
            // console.log(detections)
            const info = document.createElement('span');
            info.innerText = detections ? detections.classScore : 'no face';
            this.$el.appendChild(info)
        })
    },
    computed: {
        ...mapState({
            main: state=>state.Counter.main,
            isScreenFilterOn: state=>state.ScreenFilter.show,
            duration: state=>state.WarningMessage.duration,
            darkness: state=>state.ScreenFilter.darkness,
            blueLightFigure: state=>state.ScreenFilter.blueLightFigure,
        })
    },
    methods: {
        ...mapActions([
            'showFilter,hideFilter',
            'setWarningMode',
            'insertWarningMessage',
            'clearWarningMEssage',
            'setDarkness',
            'setBlueLightFigure'
        ]),
        showScreenFilter(boolean){
            if(boolean){
                this.$store.dispatch('showFilter');
            }
            else {
                this.$store.dispatch('hideFilter');
            }
        },
        increase(){
            this.$store.dispatch('someAsyncTask')
        },
        decrease(){
            this.$store.dispatch('someAsyncTask')
        },
        showGuideText(e,guideType) {
            this.guidePosition.top=e.clientY;
            this.guidePosition.left=e.clientX;
            switch(guideType) {
                case 'guide1': {
                    this.guideText='guide1에 대한 가이드라인입니다.';
                    break;
                }
            }
            this.showGuide=true;
        },
        hideGuidText(){
            this.showGuide=false;
        },
        changeMessageMode(mode) {
            this.$store.dispatch('setWarningMode',mode);
        },
        insertMessage(type) {
            this.$store.dispatch('insertWarningMessage',{type,duration:this.duration});
        },
        clearMessage(){
            this.$store.dispatch('clearWarningMEssage');
        },
        setDarkness(e){
            this.$store.dispatch('setDarkness',e.target.value);
        },
        setBlueLightFigure(e){
            this.$store.dispatch('setBlueLightFigure',e.target.value);
        },
    }
}
</script>

<style>

</style>