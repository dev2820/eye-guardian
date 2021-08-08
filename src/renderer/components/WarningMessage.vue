<template>
    <transition-group name="flip" tag="div" id="warning-message-queue"
            :class="{'regular-top':mode==='regular-top',
                'regular-bottom':mode==='regular-bottom',
                'mini':mode==='mini',
            }"
    >
        <div class="message flip-item" v-for="(message,index) in messages" :key="index">
            <font-awesome-icon icon="exclamation-triangle" class="icon"/>
            <p class="text">{{message.type | messageFilter}}</p>
        </div>
    </transition-group>
</template>
<script>
import { mapState } from 'vuex'
export default {
    name:'warning-message',
    data(){
        return {
            show:false
        }
    },
    computed: {
        ...mapState({
            mode: state=>state.WarningMessage.mode,
            messages: (state)=>state.WarningMessage.messageQueue
        }),
    },
    filters: {
        messageFilter(type){
            switch(type){
                case 'eye-blink':{
                    return '눈 깜빡임 경고'
                }
                case 'too-close':{
                    return '디스플레이 거리 경고'
                }
                case 'bright-warning':{
                    return '주변이 너무 어둡습니다. 지금은 아니지만 추후 자동으로 화면 밝기를 조정할 예정입니다.'
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
#warning-message-queue {
    flex-direction:column;
    position:fixed;
    opacity:1;
    display:flex;
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
    background: rgba(127,127,127,0.9);
    color:#ffdb00;
    border-radius:8px;
    text-align:center;
    font-weight:bold;
    font-size:1.3em;
    padding:10px;
    margin-top:10px;
}
.flip-item {
    transition:all 0.5s;
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