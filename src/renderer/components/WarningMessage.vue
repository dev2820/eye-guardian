<template>
    <div id="warning-message" 
        :class="{'regular-top':mode==='regular-top',
                'regular-bottom':mode==='regular-bottom',
                'mini':mode==='mini'
                }" 
    >
        <font-awesome-icon icon="exclamation-triangle" class="icon"/>
        <div class="message">{{message}}</div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name:'warning-message',
    data(){
        return {
            message:'경고메세지임',
        }
    },
    computed: {
        ...mapState({
            mode: state=>state.WarningMessage.mode
        }),
    }
}
</script>
<style scoped>
#warning-message {
    position:fixed;
    background: rgba(127,127,127,0.9);
    color:#ffdb00;
    border-radius:8px;
    text-align:center;
    font-weight:bold;
    font-size:1.3em;
    display:flex;
    padding:10px;
}
#warning-message.regular-top {
    flex-direction:row;
    height:80px;
    width:700px;
    left:50%;
    margin-left:-350px;
    top:50px;
    justify-content: left;
}
#warning-message.regular-bottom {
    flex-direction:row;
    height:80px;
    width:700px;
    left:50%;
    margin-left:-350px;
    bottom:150px;
    justify-content: left;
}
#warning-message.mini {
    height:150px;
    width:300px;
    right:5px;
    bottom:45px;
    flex-direction:column;
    justify-content: center;
}
#warning-message .icon,
#warning-message .message {
    margin:auto 0;
}
#warning-message.mini .icon,
#warning-message.mini .message {
    margin:0 auto;
}
#warning-message .message {
    padding:0 10px;
}
#warning-message .icon {
    width:50px;
    height:50px;
    font-size:1.5em;
}
#warning-message .message {
}
</style>