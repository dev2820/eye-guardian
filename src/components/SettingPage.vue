<template>
    <header>
        <title-bar title="eye guardian" 
            @minimize="minimizeWindow"
            @maximize="maximizeWindow"
            @close="closeWindow"
        />
    </header>
    <main id="setting-page">
        <div id="main-image">
            <img src="../assets/images/test.jpg"/>
        </div>
        <div id="settings">
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
                    <custom-select :options="['regular-top','regular-bottom','mini']" @select="changeMessageMode" :checked="messageMode"/>
                </div>
                <div>
                    경고문 유지 시간
                    <custom-input-number :value="duration" @change="setWarningDuration" :min="1" :max="10"/>
                </div>
                <div>
                    경고음 컨트롤
                    <custom-check-box @on="setIsPlaySound(true)" @off="setIsPlaySound(false)" :checked="isPlaySound"/>
                </div>
                <span>
                    얼굴 거리 설정
                    <tooltip alt="사용자와 모니터 사이의 거리 측정에 사용될 기준값을 설정합니다. 모니터와 적정거리를 유지하고 버튼을 누르면 측정합니다.">
                        <font-awesome-icon icon="question-circle" class="icon"/>
                    </tooltip>
                </span>
                <button @click="saveDistanceStd()">저장</button>
                <span v-if="timer>0">{{timer}}</span>
            </section>
            <CardUI>
                <h3>화면 접근 경고<toggle @on="setDistanceWarning(true)" @off="setDistanceWarning(false)" :checked="isDistanceWarningOn"></toggle></h3>
            </CardUI>
            <CardUI>
                <h3>눈 깜빡임 경고<toggle @on="setEyeblinkWarning(true)" @off="setEyeblinkWarning(false)" :checked="isEyeblinkWarningOn"></toggle></h3>
            </CardUI>
            <CardUI>
                <h3>장시간 착석 경고<toggle @on="setSittedWarning(true)" @off="setSittedWarning(false)" :checked="isSittedWarningOn"></toggle></h3>
                <label>
                    스트레칭 가이드<custom-check-box @on="setStretchGuide(true)" @off="setStretchGuide(false)" :checked="isStretchGuideOn"/>
                </label>
                <!-- <toggle :checked="" @on="" @off=""></toggle> -->
                <button @click="playStretchGuide">스트레칭 가이드 보여주기</button>
            </CardUI>
            <CardUI>
                <h3>밝기 경고<toggle @on="setBrightWarning(true)" @off="setBrightWarning(false)" :checked="isBrightWarningOn"></toggle></h3>
                <label title="사용자의 환경에 맞춰 자동으로 밝기를 조절합니다.">
                    auto<custom-check-box @on="setAutoDarknessControl(true)" @off="setAutoDarknessControl(false)" :checked="autoDarknessControl"/>
                </label>
                <div>
                    darkness 설정
                    <custom-input-range :value="darkness" @change="setDarkness($event)" :min="0" :max="0.5" :step="0.01" :disabled="autoDarknessControl"/>
                </div>
            </CardUI>
            <CardUI>
                <h4>화면 필터<toggle @on="showScreenFilter(true)" @off="showScreenFilter(false)" :checked="isScreenFilterOn"></toggle></h4>
                <div>
                    blueLight 설정
                    <tooltip alt="????">
                        <font-awesome-icon icon="question-circle" class="icon"/>    
                    </tooltip>
                    <custom-input-range :value="blueLightFigure" @change="setBlueLightFigure($event)" :min="0" :max="0.5" :step="0.01"/>
                </div>
            </CardUI>
            <section>
                디버깅용 섹션, 추후 지울 것
                <div>
                    <button @click="insertMessage('eye-blink','warning')">insert eye-blink warning</button>
                <button @click="insertMessage('distance-warning','warning')">insert too-close warning</button>
                <button @click="insertMessage('bright-warning','warning')">insert bright warning</button>
                </div>
            </section>
        </div>
    </main>
</template>
<script>  
import { ipcRenderer as ipc } from 'electron'
import CardUI from './widgets/CardUI.vue';
import TitleBar from './TitleBar.vue'
import CustomInputRange from './widgets/CustomInputRange.vue'
import CustomCheckBox from './widgets/CustomCheckBox.vue'
import CustomInputNumber from './widgets/CustomInputNumber.vue'
import CustomSelect from './widgets/CustomSelect.vue'
import Tooltip from './widgets/Tooltip.vue'
import Toggle from './widgets/Toggle.vue'
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
            timer:0,
            messageMode:'regular-top',
            isPlaySound:false,
            isStretchGuideOn:false,
            autoDarknessControl:false,
            isDistanceWarningOn:false,
            isSittedWarningOn:false,
            isBrightWarningOn:false,
            isEyeblinkWarningOn:false,
        }
    },
    components: {
        CardUI,
        TitleBar,
        CustomInputRange,
        CustomCheckBox,
        CustomInputNumber,
        CustomSelect, 
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
            this.isPlaySound = payload.warningMessage.isPlaySound;
            this.isStretchGuideOn = payload.stretchGuideScreen.isStretchGuideOn
            this.autoDarknessControl = payload.faceProcess.autoDarknessControl
            this.isDistanceWarningOn = payload.faceProcess.isDistanceWarningOn
            this.isSittedWarningOn = payload.faceProcess.isSittedWarningOn
            this.isBrightWarningOn = payload.faceProcess.isBrightWarningOn
            this.isEyeblinkWarningOn = payload.faceProcess.isEyeblinkWarningOn
            
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
        setDistanceWarning(boolean){
            this.isDistanceWarningOn = boolean
            ipc.send('SET_DISTANCE_WARNING',boolean);
        },
        setSittedWarning(boolean){
            this.isSittedWarningOn = boolean
            ipc.send('SET_SITTED_WARNING',boolean);
        },
        setBrightWarning(boolean){
            this.isBrightWarningOn = boolean
            ipc.send('SET_BRIGHT_WARNING',boolean);
        },
        setEyeblinkWarning(boolean){
            this.isEyeblinkWarningOn = boolean
            ipc.send('SET_EYEBLINK_WARNING',boolean);
        },
        setAutoDarknessControl(boolean){
            this.autoDarknessControl = boolean;
            ipc.send('SET_AUTO_DARKNESS_CONTROL',boolean);
        },
        setDarkness(e){
            this.darkness = parseFloat(e.target.value);
            ipc.send('SET_DARKNESS',this.darkness);
        },
        setBlueLightFigure(e){
            this.blueLightFigure = parseFloat(e.target.value);
            ipc.send('SET_BLUELIGHTFIGURE',this.blueLightFigure);
        },
        changeMessageMode(e) {
            if(e.target.value!==this.messageMode) {
                this.messageMode=e.target.value;
            ipc.send('SET_WARNING_MODE',e.target.value);
            ipc.send('INSERT_MESSAGE',{content:'message-position',type:'normal'});
            }
        },
        insertMessage(content,type) {
            ipc.send('INSERT_MESSAGE',{content,type});
        },
        setWarningDuration(e){
            this.duration = parseInt(e.target.value);
            ipc.send('SET_WARNING_DURATION',this.duration);
        },
        playStretchGuide(){
            ipc.send('SHOW_STRETCH_GUIDE');
        },
        setStretchGuide(boolean) {
            this.isStretchGuideOn = boolean;
            ipc.send('SET_STRETCH_GUIDE',boolean);
        },
        setIsPlaySound(boolean) {
            this.isPlaySound = boolean;
            ipc.send('SET_IS_PLAY_SOUND',boolean);
        },
        minimizeWindow() {
            ipc.send('MINIMIZE','settingPage');
        },
        maximizeWindow() {
            ipc.send('MAXIMIZE','settingPage');
        },
        closeWindow() {
            ipc.send('CLOSE','settingPage');
        },
    }
}
</script>

<style>
header {
    height:30px;
}
main#setting-page {
    height:calc(100% - 30px);
    display:flex;
    flex-direction:row;
    background:var(--background-color);
}
#setting-page #main-image {
    width:35%;
}
#setting-page #settings {
    width:65%;
    position:relative;
    display:inline-flex;
    flex-wrap:wrap;
}
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