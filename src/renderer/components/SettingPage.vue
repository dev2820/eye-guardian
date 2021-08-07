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
        
    </div>
</template>

<script>

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
            blueLightFigureModel:0,
            detectFace:'no face'
        }
    },
    components: { 
        Tooltip 
    },
    mounted(){
        // ipc.on('SCREEN_FILTER_CONTROL',(e,payload)=>{
        //     this.showScreenFilter(payload);
        // })
        
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
        }
    }
}
</script>

<style>

</style>