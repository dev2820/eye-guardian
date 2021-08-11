<template>
    <div>
        <h2>setting page</h2>
        <img src="../assets/test.jpg"/>
        <img src="images/test.jpg"/>
        <div v-if="loadCameraStatus === 'loading'">
            <font-awesome-icon icon="spinner" class="icon" spin/>
            카메라 로드중...
        </div>
        <div v-else-if="loadCameraStatus === 'success'">
            <font-awesome-icon icon="check" class="icon"/>
            카메라 로드 성공!
        </div>
        <div v-else-if="loadCameraStatus === 'failed'">
            <font-awesome-icon icon="times" class="icon"/>
            카메라 로드 실패...
        </div>
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
            <button @click="insertMessage('eye-blink','warning')">insert eye-blink warning</button>
            <button @click="insertMessage('distance-warning','warning')">insert too-close warning</button>
            <button @click="insertMessage('bright-warning','warning')">insert bright warning</button>
            <button @click="clearMessage()">clear message</button>
        </section>
        <section>
            얼굴 거리 설정
            <button @click="saveDistanceStd()">저장</button>
            <span v-if="timer>0">{{timer}}</span>
        </section>
        <font-awesome-icon icon="question-circle" class="icon" @mouseenter="showGuideText($event,'guide1')" @mouseleave="hideGuideText()"/>
        <tooltip :show="showGuide" :position="guidePosition">{{guideText}}</tooltip>
        <hr/>
        <font-awesome-icon icon="question-circle" class="icon" @mouseenter="showGuideText($event,'guide1')" @mouseleave="hideGuideText()"/>
        <hr/>
        {{isScreenFilterOn}}
        {{duration}}
        {{darkness}}
        {{blueLightFigure}}
        <Toggle></Toggle>
    </div>
</template>
<script>

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
            isScreenFilterOn: false,
            duration: 3,
            darkness: 0,
            blueLightFigure: 0,
            loadCameraStatus: 'loading',
            timer:0
        }
    },
    components: { 
        Tooltip,
        Toggle 
    },
    mounted(){
        ipc.send('REQUEST_INIT_SCREEN_VALUE','settingPage')
        ipc.on('INIT',(evt,payload)=>{
            this.isScreenFilterOn = payload.screenFilter.show;
            this.duration = parseInt(payload.warningMessage.duration);
            this.darkness = parseFloat(payload.screenFilter.darkness);
            this.blueLightFigure = parseFloat(payload.screenFilter.blueLightFigure);
        })
        ipc.on('INSERT_BRIGHT_WARNING',(evt,payload)=>{
            this.insertMessage(payload.type);
        })
        ipc.on('LOAD_CAMERA_SUCCESS',()=>{
            this.loadCameraStatus = 'success' 
        })        
        ipc.on('LOAD_CAMERA_FAILED',()=>{
            this.loadCameraStatus = 'failed' 
        })
        ipc.on('RUN_TIMER',()=>{
            this.timer=5;
            setTimeout(()=>this.timer--,1*1000);
            setTimeout(()=>this.timer--,2*1000);
            setTimeout(()=>this.timer--,3*1000);
            setTimeout(()=>this.timer--,4*1000);
        })
    },
    methods: {
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
        showScreenFilter(boolean){
            this.isScreenFilterOn = boolean;
            ipc.send('SET_FILTER_SHOW',boolean)
        },
        saveDistanceStd(){
            if(this.loadCameraStatus === 'success'){
                ipc.send('ESTIMATE_DISTANCE',1);
            }
            else {
                ipc.send('INSERT_MESSAGE',{content:'cant-detect-camera',type:'warning'});
            }
        },
        setDarkness(e){
            this.darkness = e.target.value;
            ipc.send('SET_DARKNESS',e.target.value);
        },
        setBlueLightFigure(e){
            this.blueLightFigure = e.target.value;
            ipc.send('SET_BLUELIGHTFIGURE',e.target.value);
        },
        hideGuideText(){
            this.showGuide=false;
        },
        changeMessageMode(mode) {
            ipc.send('SET_WARNING_MODE',mode);
        },
        insertMessage(content,type) {
            ipc.send('INSERT_MESSAGE',{content,type});
        },
        clearMessage(){
            // ipc.send('SET_WARNING_MODE',mode);
        },
        setWarningDuration(e){
            this.duration = e.target.value;
            ipc.send('SET_WARNING_DURATION',e.target.value);
        },
        playStretchGuide(){
            ipc.send('SHOW_STRETCH_GUIDE');
        }
    }
}
</script>

<style>
img {
    width:100px;
    height:100px;
}
section {
    display:flex;
    flex-direction: column;
    margin-bottom:10px;
}
</style>