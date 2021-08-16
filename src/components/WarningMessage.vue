<template>
    <transition-group name="flip" tag="div" id="warning-message-queue"
            :class="{'regular-top':mode==='regular-top',
                'regular-bottom':mode==='regular-bottom',
                'mini':mode==='mini',
            }"
    >
        <audio ref="warning-sound">
            <source src="local-audio://musics/warning.wav" type="audio/wav" :volume="warningVolume"/>
        </audio>
        <audio ref="normal-sound">
            <source src="local-audio://musics/normal.wav" type="audio/wav" :volume="warningVolume"/>
        </audio>
        <div class="message flip-item" v-for="(message,index) in messages" :key="index"
            :class="{
                'normal':message.type==='normal',
                'warning':message.type==='warning'
            }"
        >
            <font-awesome-icon v-if="message.type==='warning'" icon="exclamation-triangle" class="icon"/>
            <font-awesome-icon v-if="message.type==='normal'" icon="info-circle" class="icon"/>
            <p class="delimeter">|</p><p class="text">{{messageFilter(message.content)}}</p>
        </div>
    </transition-group>
</template>
<script>
// import setting from '@/assets/setting.json'
import { ipcRenderer as ipc } from 'electron'
export default {
    name:'warning-message',
    data(){
        return {
            mode:'regular-top',
            messages: [],
            warningVolume:0,
            duration:3
        }
    },
    mounted(){
        ipc.send('REQUEST_INIT_SCREEN_VALUE','warningMessage');
        ipc.on('INIT',(evt,payload)=>{
            this.mode = payload.warningMessage.mode;
            this.warningVolume = parseFloat(payload.warningMessage.warningVolume);
        })
        ipc.on('SET_WARNING_MODE',(evt,payload)=>{
            this.mode = payload;
        })
        ipc.on('INSERT_MESSAGE',(evt,payload)=>{
            this.messages.unshift(payload);
            if(this.warningVolume>0) {
                this.playSound(payload.type)
            }
            setTimeout(()=>{
                this.messages.pop()
            },this.duration*1000)
        })
        ipc.on('SET_WARNING_VOLUME',(evt,payload)=>{
            this.warningVolume = parseFloat(payload);
            this.$refs['warning-sound'].querySelector('source').volume=this.warningVolume;
            this.$refs['normal-sound'].querySelector('source').volume=this.warningVolume;
        })
    },
    methods:{
        playSound(type){
            if(type==='normal') {
                this.$refs['normal-sound'].play();
            }
            else if(type==='warning') {
                this.$refs['warning-sound'].play();
            }
        },
        messageFilter(content){
            switch(content){
                case 'eye-blink':{
                    return '눈이 건조해지고 있습니다. 눈을 더 자주 깜빡여주세요.'
                }
                case 'bright-warning':{
                    return '주변이 너무 어둡습니다. 주변을 밝게 해주세요.'
                }
                case 'bright-warning-auto':{
                    return '주변이 너무 어둡습니다. 자동으로 밝기를 조절할게요.'
                }
                case 'distance-warning':{
                    return '화면과의 거리가 너무 가깝습니다. 적정거리를 유지해주세요.'
                }
                case 'capture-face': {
                    return '정자세 기준이 설정되었어요.'
                }
                case 'no-face': {
                    return '흠... 얼굴을 못찾겠네요. 카메라를 정면으로 바라봐주세요'
                }
                case 'ready-to-capture': {
                    return '정자세 기준을 설정합니다. 바른자세로 카메라를 응시해 주세요. 5~10초의 시간이 소요됩니다.'
                }
                case 'cant-detect-camera': {
                    return '카메라가 준비되면 다시 시도해 주세요.'
                }
                case 'message-position': {
                    return '이제 이 위치에 메세지가 출력됩니다.'
                }
                case 'stare-time':{
                    return '너무 오랜시간 화면을 보고 있어요. 5분만 눈에게 휴식시간을 주세요'
                }
                default: {
                    return ''
                }
            }
        }
    }
}
</script>
<style scoped>
@font-face { 
    font-family: 'Nanum_Gothic';
    src: local('Nanum-Gothic'),
        url('../assets/fonts/Nanum_Gothic/NanumGothic-Regular.woff2'),
        url('../assets/fonts/Nanum_Gothic/NanumGothic-Regular.ttf');
    /* font-display:block; */
}
#warning-message-queue {
    flex-direction:column;
    position:fixed;
    opacity:1;
    display:flex;
    font-family: 'Nanum_Gothic'
}
#warning-message-queue.regular-top {
    justify-content: flex-start;
    height:80px;
    width:600px;
    left:50%;
    margin-left:-300px;
    top:50px;
    justify-content: left;
}
#warning-message-queue.regular-bottom {
    justify-content: flex-start;
    flex-direction:column-reverse;
    height:80px;
    width:600px;
    left:50%;
    margin-left:-300px;
    bottom:150px;
    justify-content: left;
}
#warning-message-queue.mini {
    justify-content: flex-end;
    width:300px;
    height:500px;
    right:5px;
    bottom:45px;
}
#warning-message-queue .message {
    display:flex;
    flex-direction:row;
    position:relative;
    border-radius:8px;
    text-align:center;
    font-weight:bold;
    font-size:1.3em;
    padding:10px 20px;
    margin-top:10px;
    color:#EBEEF5;
}
#warning-message-queue .message .icon {
    margin:auto 0;
}
#warning-message-queue .message .delimeter {
    margin:auto 10px;
}
#warning-message-queue .message .text {
    flex-grow:1;
    margin:auto 0;
    text-align:center;
}
.normal {
    opacity:0.9;
    background-color:var(--success-color);
}
.warning {
    opacity:0.9;
    background-color:var(--danger-color);
}
.flip-item {
    transition:all 0.3s;
    display:inline-block;
}
.flip-enter, .flip-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
.flip-leave-active {
    position: absolute;
}
</style>