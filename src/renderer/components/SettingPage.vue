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
        <video onplay="onPlay(this)" id="inputVideo" autoplay muted></video>
        <canvas id="overlay" width="300" height="300" />
    </div>
</template>

<script>
import * as faceapi from 'face-api.js';
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
        // this.run();
        // this.showMyFace();
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
        async run() {
        // load the models
            console.log('??')
            await faceapi.loadMtcnnModel('/')
            await faceapi.loadFaceRecognitionModel('/')
            console.log('????')
            // try to access users webcam and stream the images
            // to the video element
            const videoEl = document.getElementById('inputVideo')
            navigator.getMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetuserMedia ||
            navigator.msGetUserMedia;

            navigator.getMedia(
                { video: true },
                stream => videoEl.srcObject = stream,
                err => console.error(err)
            )
            const mtcnnForwardParams = {
                minFaceSize: 200
            }

            const mtcnnResults = await faceapi.mtcnn(document.getElementById('inputVideo'), mtcnnForwardParams)
            console.log(mtcnnResults)
            faceapi.drawDetection('overlay', mtcnnResults.map(res => res.faceDetection), { withScore: false })
            faceapi.drawLandmarks('overlay', mtcnnResults.map(res => res.faceLandmarks), { lineWidth: 4, color: 'red' })

        },
        showMyFace() {
            var canvas = document.getElementById('overlay'),
            context = canvas.getContext('2d'),
            video = document.getElementById('inputVideo'),
            vendorUrl = window.URL || window.webkitURL;
            
            navigator.getMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetuserMedia ||
            navigator.msGetUserMedia;
            
            navigator.getMedia({
                video: true,
                audio: false
            }, function(stream) {
                video.src = vendorUrl.createObjectURL(stream);
                video.play();
            }, function(error) {
                // an error occurred
            } );
            
            video.addEventListener('play', function() {
                draw( this, context, 1024, 768 );
            }, false );
            
            function draw( video, context, width, height ) {
                var image, data, i, r, g, b, brightness;
                
                context.drawImage( video, 0, 0, width, height );
                
                image = context.getImageData( 0, 0, width, height );
                data = image.data;
                
                for( i = 0 ; i < data.length ; i += 4 ) {
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];
                brightness = ( r + g + b ) / 3;
                
                data[i] = data[i + 1] = data[i + 2] = brightness;
                }
                
                image.data = data;
                
                context.putImageData( image, 0, 0 );
                
                setTimeout( draw, 10, video, context, width, height );
            }
        }
    }
}
</script>

<style>

</style>