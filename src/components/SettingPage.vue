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
            <img id="mascot" src="../assets/images/mascot.png"/>
        </div>
        <div id="settings">
            <section class="status">
                <div class="camera-load-status">
                    <status-dot :status="loadCameraStatus"/>
                    <small class="status-message">{{loadCameraMessage}}</small>
                </div>
                <div class="standard-pos-status">
                    <status-dot :status="standardPosStatus"/>
                    <small class="status-message">{{standardPosMessage}}</small>
                </div>
            </section>
            <section class="warning-setting">
                <div class="setting-option warning-position">
                    <p class="explanation">경고문 위치</p>
                    <custom-select :options="['regular-top','regular-bottom','mini']" @select="changeMessageMode" :checked="messageMode"/>
                </div>
                <div class="setting-option warning-sound">
                    <span class="explanation">경고음 출력</span>
                    <custom-check-box @on="setIsPlaySound(true)" @off="setIsPlaySound(false)" :checked="isPlaySound"/>
                </div>
                <div class="setting-option standard-pos-setting">
                    <span class="explanation">정자세 기준 설정하기</span>
                    <font-awesome-icon icon="question-circle" class="icon" title="사용자가 정자세를 취하고있는지 판단하는데 도움이되는 기준값을 설정합니다."/>
                    <button @click="setStandardPos()">설정</button>
                    <span v-if="timer>0">{{timer}}</span>
                </div>
            </section>
            <section class="alarm-setting">
                <CardUI>
                    <div class="title">
                        <h3>화면 접근 경고</h3><toggle @on="setDistanceWarning(true)" @off="setDistanceWarning(false)" :checked="isDistanceWarningOn"></toggle>
                    </div>
                    <small>
                        디스플레이를 너무 가까이서 보게되면 눈에 이러이러케 안좋습니다.
                    </small>
                </CardUI>
            </section>
            <section class="alarm-setting">
                <CardUI>
                    <div class="title">
                        <h3>눈 깜빡임 경고</h3><toggle @on="setEyeblinkWarning(true)" @off="setEyeblinkWarning(false)" :checked="isEyeblinkWarningOn"></toggle>
                    </div>
                    <small>
                        화면에 집중하다보면 눈 깜빡이는 횟수가 평균보다 절반가량 줄어들게됩니다. 이는 안구건조증을 유발하고 등등
                    </small>
                </CardUI>
            </section>
            <section class="alarm-setting">
                <CardUI>
                    <div class="title">
                        <h3>장시간 착석 경고</h3><toggle @on="setSittedWarning(true)" @off="setSittedWarning(false)" :checked="isSittedWarningOn"></toggle>
                    </div>
                    <label>
                        스트레칭 가이드<custom-check-box @on="setStretchGuide(true)" @off="setStretchGuide(false)" :checked="isStretchGuideOn"/>
                    </label>
                    <!-- <button @click="playStretchGuide">스트레칭 가이드 보여주기</button> -->
                </CardUI>
            </section>
            <section class="alarm-setting">
                <CardUI>
                    <div class="title">
                        <h3>밝기 자동 조절</h3><toggle @on="setIsAutoDarknessControlOn(true)" @off="setIsAutoDarknessControlOn(false)" :checked="isAutoDarknessControlOn"></toggle>
                    </div>
                    <small>수동조절</small>
                    <!-- <font-awesome-icon icon="sun"/> -->
                    <custom-input-range :value="darkness" @change="setDarkness($event)" :min="0" :max="0.5" :step="0.01" :disabled="isAutoDarknessControlOn"/>
                </CardUI>
            </section>
            <section class="alarm-setting">
                <CardUI>
                    <div class="title">
                        <h3>편안하게 화면보기</h3><toggle @on="showBlueLightFilter(true)" @off="showBlueLightFilter(false)" :checked="isBlueLightFilterOn"></toggle>
                    </div>
                    <div>
                        blueLight 설정
                        <tooltip alt="????">
                            <font-awesome-icon icon="question-circle" class="icon"/>    
                        </tooltip>
                        <custom-input-range :value="blueLightFigure" @change="setBlueLightFigure($event)" :min="0" :max="0.5" :step="0.01"/>
                    </div>
                </CardUI>
            </section>
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
import CardUI from './widgets/CardUI.vue'
import TitleBar from './TitleBar.vue'
import CustomInputRange from './widgets/CustomInputRange.vue'
import CustomCheckBox from './widgets/CustomCheckBox.vue'
import CustomInputNumber from './widgets/CustomInputNumber.vue'
import CustomSelect from './widgets/CustomSelect.vue'
import Tooltip from './widgets/Tooltip.vue'
import Toggle from './widgets/Toggle.vue'
import StatusDot from './widgets/StatusDot.vue';
export default {
    data(){
        return {
            guideText:'',
            timer:0,
            isBlueLightFilterOn: false,
            blueLightFigure: 0,
            isAutoDarknessControlOn:false,
            darkness: 0,
            loadCameraStatus: 'ongoing',
            loadCameraMessage:'카메라 로드중...',
            standardPosStatus: 'ongoing',
            standardPosMessage:'정자세 기준값 불러오는중...',
            messageMode:'regular-top',
            isPlaySound:false,
            isStretchGuideOn:false,
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
        Toggle,
        StatusDot 
    },
    mounted(){
        ipc.send('REQUEST_INIT_SCREEN_VALUE','settingPage')
        ipc.on('INIT',(evt,payload)=>{
            this.isBlueLightFilterOn = payload.screenFilter.isBlueLightFilterOn;
            this.darkness = parseFloat(payload.screenFilter.darkness);
            this.blueLightFigure = parseFloat(payload.screenFilter.blueLightFigure);
            this.isPlaySound = payload.warningMessage.isPlaySound;
            this.isStretchGuideOn = payload.stretchGuideScreen.isStretchGuideOn
            this.isAutoDarknessControlOn = payload.faceProcess.isAutoDarknessControlOn
            this.isDistanceWarningOn = payload.faceProcess.isDistanceWarningOn
            this.isSittedWarningOn = payload.faceProcess.isSittedWarningOn
            this.isBrightWarningOn = payload.faceProcess.isBrightWarningOn
            this.isEyeblinkWarningOn = payload.faceProcess.isEyeblinkWarningOn
        
            if(payload.faceProcess.faceLength<=0) {
                this.standardPosStatus = 'failed';
                this.standardPosMessage = '정자세 기준값이 설정되어있지 않습니다. 설정버튼을 눌러 기준값 설정을 완료해주세요.'
            }
            else {
                this.standardPosStatus = 'complete';
                this.standardPosMessage = '정자세 기준값이 설정되어있습니다.'
            }
        })
        ipc.on('INSERT_BRIGHT_WARNING',(evt,payload)=>{
            this.insertMessage(payload.type);
        })
        ipc.on('LOAD_CAMERA_SUCCESS',()=>{
            this.loadCameraStatus = 'complete';
            this.loadCameraMessage = '카메라 로드 성공!'
        })        
        ipc.on('LOAD_CAMERA_FAILED',()=>{
            this.loadCameraStatus = 'failed' 
            this.loadCameraMessage = '카메라 로드 실패...'
        })
        ipc.on('SET_FACE_DISTANCE_SUCCESS',()=>{
            this.standardPosStatus = 'complete';
            this.standardPosMessage = '정자세 기준값이 설정되어있습니다.'
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
        showBlueLightFilter(boolean){
            this.isBlueLightFilterOn = boolean;
            ipc.send('SET_BLUELIGHT_FILTER_SHOW',boolean)
        },
        setStandardPos(){
            if(this.loadCameraStatus === 'complete'){
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
        setIsAutoDarknessControlOn(boolean){
            this.isAutoDarknessControlOn = boolean;
            ipc.send('SET_AUTO_DARKNESS_CONTROL',boolean);
        },
        setDarkness(e){
            this.darkness = parseFloat(e.target.value);
            ipc.send('SET_DARKNESS',this.darkness);
        },
        setBlueLightFigure(e){
            this.blueLightFigure = parseFloat(e.target.value);
            ipc.send('SET_BLUELIGHT_FIGURE',this.blueLightFigure);
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

<style scoped>
header {
    height:30px;
}
main#setting-page {
    height:calc(100% - 30px);
    display:flex;
    flex-direction:row;
    background:var(--background-color);
    color:var(--text-regular-color);
}
main#setting-page * {
    user-select: none;
}
#setting-page #main-image {
    flex-grow:1;
    position:relative;
}
#setting-page #settings {
    width:600px;
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
section.status > div {
    display:flex;
    flex-direction:row;
}
section.status > div > *{
    margin:auto 0;
}
section.status .status-message {
    margin-left: 5px;
}
section.warning-setting {
    width:100%;
}
.setting-option {
    margin-bottom:10px;
}
.setting-option .explanation {
    margin-bottom:5px;
}
.setting-option .unit {
    margin-left:5px;
}
.setting-option.warning-sound {
    display:flex;
}
.setting-option.warning-sound *{
    margin:auto 0;
}
.setting-option.warning-sound > .explanation{
    margin-right:5px;
}
.setting-option.standard-pos-setting > .explanation{
    margin-right:5px;
}
.alarm-setting .title {
    display:flex;
    flex-direction:row;
    justify-content: space-between;
}
button {
    padding: 5px;
    width:100px;
    margin-left:20px;
}
img#mascot {
    position:absolute;
    width:300px;
    height:300px;
    left:50%;
    margin-left:-150px;
    top:50%;
    margin-top:-150px;
}
</style>