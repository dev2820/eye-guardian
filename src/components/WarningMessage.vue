<template>
    <transition-group name="flip" tag="div" id="warning-message-queue"
            :class="{'regular-top':mode==='regular-top',
                'regular-bottom':mode==='regular-bottom',
                'mini':mode==='mini',
            }"
    >
        <div class="message flip-item" v-for="(message,index) in messages" :key="index"
            :class="{
                'normal':message.type==='normal',
                'warning':message.type==='warning'
            }"
        >
            <font-awesome-icon v-if="message.type==='warning'" icon="exclamation-triangle" class="icon"/>
            <font-awesome-icon v-if="message.type==='normal'" icon="info-circle" class="icon"/>
            <p class="text">{{messageFilter(message.content)}}</p>
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
            duration:3
        }
    },
    mounted(){
        ipc.send('REQUEST_INIT_SCREEN_VALUE','warningMessage');
        ipc.on('INIT',(evt,payload)=>{
            this.mode = payload.warningMessage.mode;
            this.duration = payload.warningMessage.duration;
        })
        ipc.on('SET_WARNING_MODE',(evt,payload)=>{
            this.mode = payload;
        })
        ipc.on('INSERT_MESSAGE',(evt,payload)=>{
            this.messages.unshift(payload);
            setTimeout(()=>{
                this.messages.pop()
            },this.duration*1000)
        })
        ipc.on('SET_WARNING_DURATION',(evt,payload)=>{
            this.duration = parseInt(payload);
        })
    },
    methods:{
        messageFilter(content){
            switch(content){
                case 'eye-blink':{
                    return '눈 깜빡임 경고'
                }
                case 'bright-warning':{
                    return '주변이 너무 어둡습니다. 지금은 아니지만 추후 자동으로 화면 밝기를 조정할 예정입니다.'
                }
                case 'distance-warning':{
                    return '얼굴이 너무 가깝네요. 떨어지세요.'
                }
                case 'capture-face': {
                    return '얼굴 거리 설정이 완료되었습니다.'
                }
                case 'no-face': {
                    return '얼굴이 감지되지 않습니다.'
                }
                case 'ready-to-capture': {
                    return '5초뒤 얼굴 거리를 설정합니다. 정자세를 취해주세요'
                }
                case 'success-capture': {
                    return ''
                }
                case 'cant-detect-camera': {
                    return '카메라가 준비되면 다시 시도해 주십시오'
                }
                case 'message-position': {
                    return '이제 이 위치에 메세지가 출력됩니다'
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
    font-display:block;
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
    width:700px;
    left:50%;
    margin-left:-350px;
    top:50px;
    justify-content: left;
}
#warning-message-queue.regular-bottom {
    justify-content: flex-start;
    flex-direction:column-reverse;
    height:80px;
    width:700px;
    left:50%;
    margin-left:-350px;
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
    position:relative;
    border-radius:8px;
    text-align:center;
    font-weight:bold;
    font-size:1.3em;
    padding:10px;
    margin-top:10px;
}
.normal {
    opacity:0.5;
    background-color:var(--success-color);
    color:#EBEEF5;
}
.warning {
    opacity:0.9;
    background-color:var(--danger-color);
    color:#EBEEF5;
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