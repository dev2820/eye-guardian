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
            <font-awesome-icon class="exclamation" icon="exclamation" v-if="loadCameraStatus==='failed' || loadModelStatus==='failed' || standardPosStatus==='failed' || standardEyeStatus==='failed'"/>
            <img id="mascot" src="../assets/images/mascot3.svg"/>
            <svg id="shadow" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="100" cy="50" rx="50" ry="10" />
            </svg>
        </div>
        <div id="settings">
            <section class="status">
                <div class="camera-load-status">
                    <status-dot :status="loadCameraStatus"/>
                    <small class="status-message">{{loadCameraMessage}}</small>
                </div>
                <div class="model-load-status">
                    <status-dot :status="loadModelStatus"/>
                    <small class="status-message">{{loadModelMessage}}</small>
                </div>
                <div class="standard-pos-status">
                    <status-dot :status="standardPosStatus"/>
                    <small class="status-message">{{standardPosMessage}}</small>
                </div>
                <div class="standard-eye-status">
                    <status-dot :status="standardEyeStatus"/>
                    <small class="status-message">{{standardEyeMessage}}</small>
                </div>
            </section>
            <section class="warning-setting">
                <div class="setting-option warning-position">
                    <p class="explanation">경고문 위치</p>
                    <custom-select-radio :options="['regular-top','regular-bottom','mini']" @select="changeMessageMode" :checked="messageMode"/>
                </div>
                <div class="setting-option warning-sound">
                    <span class="explanation">경고음 출력</span>
                    <div class="control-volume">
                        <span class="icon">
                            <font-awesome-icon v-if="warningVolume>0" icon="volume-up"/>
                            <font-awesome-icon v-else icon="volume-mute"/>
                        </span>
                        <custom-input-range :value="warningVolume" @change="setWarningVolume($event)" :min="0" :max="1" :step="0.01"/>
                    </div>
                </div>
                <div class="setting-option-bundle">
                    <div class="setting-option standard-pos-setting">
                        <span class="explanation">
                            정자세 기준 설정하기
                            <font-awesome-icon icon="question-circle" class="icon" title="사용자가 정자세를 취하고있는지 판단하는데 도움이되는 기준값을 설정합니다."/>
                        </span>
                        <custom-button class="button" @click="setStandardPos()">
                            <span v-if="standardPosSetStatus==='complete'">설정</span>
                            <font-awesome-icon v-else-if="standardPosSetStatus==='ongoing'" icon="spinner" spin/>
                        </custom-button>
                    </div>
                    <div class="setting-option standard-eyesize-setting">
                        <span class="explanation">
                            눈 크기 측정하기
                            <font-awesome-icon icon="question-circle" class="icon" title="눈을 감았는지 여부를 판정하는 기준값을 설정합니다."/>
                        </span>
                        <custom-button class="button" @click="setStandardEye()">
                            <span v-if="standardEyeSetStatus==='complete'">설정</span>
                            <font-awesome-icon v-else-if="standardEyeSetStatus==='ongoing'" icon="spinner" spin/>
                        </custom-button>
                    </div>
                </div>
            </section>
            <section class="alarm-setting">
                <CardUI>
                    <div class="title">
                        <span>
                            화면 접근 경고
                            <font-awesome-icon icon="question-circle" class="icon question" title="컴퓨터화면과 눈 사이의 거리는 50~60cm를 유지하면 적당하며, 정면에서 10~15도 아래 화면 중심이 위치하는 것이 눈의 피로를 덜 수 있습니다."/>
                        </span>
                        <toggle @on="setDistanceWarning(true)" @off="setDistanceWarning(false)" :checked="isDistanceWarningOn"></toggle>
                    </div>
                    <small class="explanation">
                        화면을 가까이서 보게되는 경우 경고문을 출력합니다.
                    </small>
                </CardUI>
            </section>
            <section class="alarm-setting">
                <CardUI>
                    <div class="title">
                        <span>
                            눈 깜빡임 경고
                            <font-awesome-icon icon="question-circle" class="icon question" title="화면에 집중하다보면 눈을 깜빡이는 횟수가 평소의 1/3으로 줄어듧니다. 이는 안구를 마르게해 안구건조증이나 눈 통증을 일으킬 수 있습니다."/>
                        </span>
                        <toggle @on="setEyeblinkWarning(true)" @off="setEyeblinkWarning(false)" :checked="isEyeblinkWarningOn"></toggle>
                    </div>
                    <small class="explanation">
                        눈을 깜빡이는 횟수가 일정 이상  줄어들면 경고를 띄워 안구건조증을 예방합니다.
                    </small>
                </CardUI>
            </section>
            <section class="alarm-setting">
                <CardUI>
                    <div class="title">
                        <span>
                            장시간 화면 사용 경고
                            <font-awesome-icon icon="question-circle" class="icon question" title="1시간 이상 화면에 집중했다면 5~10분 정도 휴식하며 눈의 피로를 풀어주는 것이 좋습니다. 눈 운동은 눈의 피로를 푸는데 도움이 됩니다."/>
                        </span>
                        <toggle @on="setStareWarning(true)" @off="setStareWarning(false)" :checked="isStareWarningOn"></toggle>
                    </div>
                    <div class="stretch-guide-option">
                        <small class="option-explanation">눈 운동 가이드</small>
                        <custom-input-check-box @on="setStretchGuide(true)" @off="setStretchGuide(false)" :checked="isStretchGuideOn"/>
                    </div>
                    <small class="explanation">
                        컴퓨터를 1시간 이상 연속으로 사용한 경우 경고문을 띄웁니다. 눈 운동 가이드를 켜면 경고문과 함께 눈 운동 가이드영상을 보여줍니다.
                    </small>
                </CardUI>
            </section>
            <section class="alarm-setting">
                <CardUI>
                    <div class="title">
                        <span>
                            밝기 경고
                            <font-awesome-icon icon="question-circle" class="icon question" title="어두운 곳에서 밝은 화면을 보면 눈이 금세 피곤해집니다. 화면 밝기는 주변과 비슷한 정도가 좋습니다."/>
                        </span>
                        <toggle @on="setBrightWarning(true)" @off="setBrightWarning(false)" :checked="isBrightWarningOn"></toggle>
                    </div>
                    <div class="darkness-auto-control-option">
                        <small class="option-explanation">밝기 자동 조절</small>
                        <custom-input-check-box @on="setIsAutoDarknessControlOn(true)" @off="setIsAutoDarknessControlOn(false)" :checked="isAutoDarknessControlOn"/>
                    </div>
                    <small class="explanation">
                        어두운 환경에서 화면을 보게되는 경우 경고문을 출력합니다. 밝기 자동 조절을 켜게되면 주변환경에 맞춰 화면 밝기를 조절합니다.
                    </small>
                </CardUI>
            </section>
            <section class="alarm-setting">
                <CardUI>
                    <div class="title">
                        <span>
                            블루라이트 필터
                            <font-awesome-icon icon="question-circle" class="icon question" title="블루라이트는 가시광선 중 짧은 파장과 강한 에너지를 가진 파란색 계열의 빛으로, 눈에 높은 피로감을 주고 수면 장애를 일으킵니다."/>
                        </span>
                        <toggle @on="showBlueLightFilter(true)" @off="showBlueLightFilter(false)" :checked="isBlueLightFilterOn"></toggle>
                    </div>
                    <div class="bluelight-option">
                        <small class="option-explanation">세기</small>
                        <custom-input-range :value="blueLightFigure" @change="setBlueLightFigure($event)" :min="0" :max="0.5" :step="0.01"/>
                    </div>
                    <small class="explanation">
                        수면 유도 호르몬의 분비를 저하시키는 블루라이트를 감소시키는 필터를 씌웁니다.
                    </small>
                </CardUI>
            </section>
        </div>
    </main>
</template>
<script>  
import { ipcRenderer as ipc } from 'electron'
import CardUI from './widgets/CardUI.vue'
import TitleBar from './TitleBar.vue'
import CustomInputRange from './widgets/CustomInputRange.vue'
import CustomInputCheckBox from './widgets/CustomInputCheckBox.vue'
import CustomInputNumber from './widgets/CustomInputNumber.vue'
import CustomSelectRadio from './widgets/CustomSelectRadio.vue'
import Tooltip from './widgets/Tooltip.vue'
import Toggle from './widgets/Toggle.vue'
import StatusDot from './widgets/StatusDot.vue';
import CustomButton from './widgets/CustomButton.vue'
export default {
    data(){
        return {
            guideText:'',
            timer:0,
            warningVolume:0,
            isBlueLightFilterOn: false,
            blueLightFigure: 0,
            isAutoDarknessControlOn:false,
            // darkness: 0,
            loadCameraStatus: 'ongoing',
            loadCameraMessage:'카메라 로드중...',
            standardPosStatus: 'ongoing',
            standardPosMessage:'정자세 기준값 불러오는중...',
            standardEyeStatus: 'ongoing',
            standardEyeMessage:'감은 눈 기준값 불러오는중...',
            loadModelStatus:'ongoing',
            loadModelMessage:'얼굴감지 모델 불러오는중...',
            standardPosSetStatus: 'complete',
            standardEyeSetStatus: 'complete',
            messageMode:'regular-top',
            isStretchGuideOn:false,
            isDistanceWarningOn:false,
            isStareWarningOn:false,
            isBrightWarningOn:false,
            isEyeblinkWarningOn:false,
        }
    },
    components: {
        CardUI,
        TitleBar,
        CustomInputRange,
        CustomInputCheckBox,
        CustomInputNumber,
        CustomSelectRadio, 
        Tooltip,
        Toggle,
        StatusDot,
        CustomButton 
    },
    created(){
        ipc.send('REQUEST_INIT_SCREEN_VALUE','settingPage')
        ipc.on('INIT',(evt,payload)=>{
            this.messageMode = payload.warningMessage.mode;
            this.warningVolume = payload.warningMessage.warningVolume;
            this.isBlueLightFilterOn = payload.screenFilter.isBlueLightFilterOn;
            this.blueLightFigure = parseFloat(payload.screenFilter.blueLightFigure);
            this.isStretchGuideOn = payload.stretchGuideScreen.isStretchGuideOn
            this.isAutoDarknessControlOn = payload.faceProcess.isAutoDarknessControlOn
            this.isDistanceWarningOn = payload.faceProcess.isDistanceWarningOn
            this.isStareWarningOn = payload.faceProcess.isStareWarningOn
            this.isBrightWarningOn = payload.faceProcess.isBrightWarningOn
            this.isEyeblinkWarningOn = payload.faceProcess.isEyeblinkWarningOn
        
            if(payload.faceProcess.faceLength<=0) {
                this.standardPosStatus = 'failed';
                this.standardPosMessage = '정자세 기준값이 설정되어있지 않습니다. 설정버튼을 눌러 기준값 설정을 완료해주세요.'
            }
            else {
                this.standardPosStatus = 'complete';
                this.standardPosMessage = '정자세 기준값이 설정되어 있습니다.'
            }
            if(payload.faceProcess.eyeSize<=0) {
                this.standardEyeStatus = 'failed';
                this.standardEyeMessage = '감은 눈 기준값이 설정되어있지 않습니다. 설정버튼을 눌러 기준값 설정을 완료해주세요.'
            }
            else {
                this.standardEyeStatus = 'complete';
                this.standardEyeMessage = '감은 눈 기준값이 설정되어 있습니다.'
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

        ipc.on('LOAD_MODEL_SUCCESS',()=>{
            this.loadModelStatus = 'complete';
            this.loadModelMessage = '얼굴감지 모델 불러오기 성공!'
        })  
        ipc.on('LOAD_MODEL_FAILED',()=>{
            this.loadModelStatus = 'failed';
            this.loadModelMessage = '얼굴감지 모델 불러오기 실패...'
        })  

        ipc.on('SET_FACE_DISTANCE_SUCCESS',()=>{
            this.standardPosStatus = 'complete';
            this.standardPosSetStatus = 'complete'
            this.standardPosMessage = '정자세 기준값이 설정되어 있습니다.'
        })
        ipc.on('SET_EYESIZE_DISTANCE_SUCCESS',()=>{
            this.standardEyeStatus = 'complete';
            this.standardEyeSetStatus = 'complete'
            this.standardEyeMessage = '감은 눈 기준값이 설정되어 있습니다.'
        })
        ipc.on('NO_FACE',(evt,payload)=>{
            if(payload==='measure_eye') {
                this.standardEyeSetStatus = 'complete';
            }
            else if(payload==='face-distance'){
                this.standardPosSetStatus = 'complete';
            }
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
                this.standardPosSetStatus = "ongoing"
            }
            else {
                ipc.send('INSERT_MESSAGE',{content:'cant-detect-camera',type:'warning'});
            }
        },
        setStandardEye(){
            if(this.loadCameraStatus === 'complete'){
                
                ipc.send('MEASURE_EYESIZE',1);
                this.standardEyeSetStatus = "ongoing"
            }
            else {
                ipc.send('INSERT_MESSAGE',{content:'cant-detect-camera',type:'warning'});
            }
        },
        setDistanceWarning(boolean){
            this.isDistanceWarningOn = boolean
            ipc.send('SET_DISTANCE_WARNING',boolean);
        },
        setStareWarning(boolean){
            this.isStareWarningOn = boolean
            ipc.send('SET_STARE_WARNING',boolean);
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
        setStretchGuide(boolean) {
            this.isStretchGuideOn = boolean;
            ipc.send('SET_STRETCH_GUIDE',boolean);
        },
        setWarningVolume(e) {
            this.warningVolume = parseFloat(e.target.value);
            ipc.send('SET_WARNING_VOLUME',this.warningVolume);
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
    padding:30px 0;
    overflow:auto;
}
main#setting-page * {
    user-select: none;
}
#setting-page #main-image {
    flex-grow:1;
    position:relative;
}
#setting-page #main-image img#mascot {
    position:absolute;
    width:200px;
    height:200px;
    left:50%;
    margin-left:-100px;
    top:50%;
    margin-top:-100px;
    animation:floating 4s infinite ease-in-out;
}
#setting-page #main-image #shadow {
    fill:rgba(0,0,0,0.5);
    position:absolute;
    top:70%;
    left:50%;
    width:200px;
    margin-left:-100px;
    animation:stretch 2s infinite ease-in-out;
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
.setting-option-bundle{
    display:flex;
    flex-direction:row;
    justify-content: flex-start ;
}
.setting-option {
    display:flex;
    flex-direction:column;
    margin-bottom:10px;
}
.setting-option .explanation {
    margin-bottom:5px;
}
.setting-option.warning-sound .control-volume {
    display:flex;
}
.setting-option.warning-sound .control-volume *{
    margin:auto 0;
}
.setting-option.warning-sound .control-volume .icon {
    width:20px;
}
.setting-option.warning-sound > .explanation{
    margin-right:5px;
}
.setting-option.standard-pos-setting > .explanation{
    margin-right:5px;
}
.setting-option.standard-eyesize-setting {
    margin-right:5px;
    margin-left:130.2px;
}
.alarm-setting .title {
    font-weight:200;
    font-size:1.1rem;
    display:flex;
    flex-direction:row;
    justify-content: space-between;
    margin-bottom:8px;
}
.alarm-setting .darkness-auto-control-option .option-explanation,
.alarm-setting .stretch-guide-option .option-explanation,
.alarm-setting .bright-option .option-explanation,
.alarm-setting .bluelight-option .option-explanation{
    margin-right:5px;
}
.alarm-setting .darkness-auto-control-option {
    display:flex;
    margin-bottom:5px;
}
.alarm-setting .darkness-auto-control-option *{
    margin:auto 0;
}

.alarm-setting .stretch-guide-option {
    display:flex;
    margin-bottom:5px;
}
.alarm-setting .stretch-guide-option *{
    margin:auto 0;
}

.alarm-setting .bluelight-option {
    display:flex;
}
.alarm-setting .bluelight-option *{
    margin:auto 0;
}

.alarm-setting .bluelight-option {
    display:flex;
    margin-bottom:5px;
}
.alarm-setting .bluelight-option *{
    margin:auto 0;
}

.exclamation {
    font-size:5rem;
    color:var(--danger-color);
    position:absolute;
    width:50px;
    left:50%;
    margin-left:-25px;
    top:60px;
    animation:twinkle 1s infinite;
}
.button {
    width:100px;
}
.question {
    width:16px;
    height:16px;
}
@keyframes floating {
    0% {
        transform:translateY(0px)
    }
    25% {
        transform:translateY(-10px);
    }
    50% {
        transform:translateY(0px);
    }
    75% {
        transform:translateY(-10px);
    }
    100% {
        transform:translateY(0px) rotateZ(360deg);
    }
}
@keyframes stretch {
    0% {
        transform: scaleX(1.2);
    }
    50% {
        transform: scaleX(1);
    }
    100% {
        transform: scaleX(1.2);
    }
}
@keyframes scaleUp {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
    }
}
@keyframes twinkle {
    0% {
        opacity:1;
    }
    50% {
        opacity:0;
    }
    100% {
        opacity:1;
    }
}
@keyframes swing {
    0% {
        transform: rotateZ(0deg);
    }
    50% {
        transform: rotateZ(0deg);
    }
    60% {
        transform: rotateZ(10deg);
    }
    70% {
        transform: rotateZ(-10deg);
    }
    80% {
        transform: rotateZ(10deg);
    }
    90% {
        transform: rotateZ(-10deg);
    }
    100% {
        transform: rotateZ(0deg);
    }
}
::-webkit-scrollbar              { width:5px; }
::-webkit-scrollbar-thumb        { background:#666 }
</style>