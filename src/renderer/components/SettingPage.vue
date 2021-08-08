<template>
    <div>
        <h2>setting page</h2>
        <section>
            경고문 위치
            <div>
                <button @click="changeMessageMode('regular-top')">regular-top</button>
                <button @click="changeMessageMode('regular-bottom')">regular-bottom</button>
                <button @click="changeMessageMode('mini')">mini</button>
            </div>
            <div>
                경고문 유지 시간
                <input type="number" :value="duration" @change="setWarningDuration($event)" min="1" max="10"/>
            </div>
        </section>
        <section>
            화면 접근 경고
            
        </section>
        <section>
            눈 깜빡임 경고
        </section>
        <section>
            장시간 착석 경고
            스트레칭 가이드 
            <!-- <toggle :checked="" @on="" @off=""></toggle> -->
            <button @click="playStretchGuide">스트레칭 가이드 보여주기</button>
        </section>
        <section>
            화면 필터
            {{isScreenFilterOn}}
            <button @click="showScreenFilter(true)">screen filter on</button>
            <button @click="showScreenFilter(false)">screen filter off</button>
            blueLight 설정<input type="range" :value="blueLightFigure" @change="setBlueLightFigure($event)" min="0" max="0.5" step="0.01">
            화면 명도 설정<input type="range" :value="darkness" @change="setDarkness($event)" min="0" max="0.5" step="0.01">
        </section>
        <section>
            디버깅용 섹션, 추후 지울 것
            <button @click="insertMessage('eye-blink')">insert eye-blink warning</button>
            <button @click="insertMessage('too-close')">insert too-close warning</button>
            <button @click="insertMessage('bright-warning')">insert bright warning</button>
            <!-- <button @click="clearMessage()">clear message</button> -->
        </section>

        <font-awesome-icon icon="question-circle" class="icon" @mouseenter="showGuideText($event,'guide1')" @mouseleave="hideGuideText()"/>
        <tooltip :show="showGuide" :position="guidePosition">{{guideText}}</tooltip>
        <hr/>
        <font-awesome-icon icon="question-circle" class="icon" @mouseenter="showGuideText($event,'guide1')" @mouseleave="hideGuideText()"/>
        
        <hr/>
        
    </div>
</template>

<script>
import { mapState,mapMutations,mapActions } from 'vuex'
import { ipcRenderer as ipc } from 'electron'
import Tooltip from './Tooltip.vue'
import Toggle from './Toggle.vue'
export default {
    data(){
        return {
            guideText:'',
            showGuide:false,
            guidePosition: {
                top:0,
                left:0
            },
        }
    },
    components: { 
        Tooltip,
        Toggle 
    },
    mounted(){
        
    },
    computed: {
        ...mapState({
            isScreenFilterOn: state=>state.ScreenFilter.show,
            duration: state=>state.WarningMessage.duration,
            darkness: state=>state.ScreenFilter.darkness,
            blueLightFigure: state=>state.ScreenFilter.blueLightFigure,
        })
    },
    methods: {
        ...mapActions([
            'showFilter',
            'hideFilter',
            'setWarningMode',
            'insertWarningMessage',
            'clearWarningMEssage',
            'setDarkness',
            'setBlueLightFigure',
            'setWarningDuration'
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
        hideGuideText(){
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
        setWarningDuration(e){
            this.$store.dispatch('setWarningDuration',e.target.value);
        },
        playStretchGuide(){
            ipc.send('SHOW_STRETCH_GUIDE');
        }
    }
}
</script>

<style>
section {
    display:flex;
    flex-direction: column;
    margin-bottom:10px;
}
</style>