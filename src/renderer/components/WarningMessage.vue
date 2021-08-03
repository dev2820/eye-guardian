<template>
    <div id="warning-message" :style=regularTopStyle>
        <span class="icon">icon</span>
        <span class="message">{{message}}</span>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name:'warning-message',
    data(){
        return {
            message:'경고메세지임',
            regularTopStyle: {
                height:'80px',
                width:'700px',
                left:'50%',
                marginLeft:'-350px',
                top:'50px'
            }
        }
    },
    computed: {
        ...mapState({
            mode: state=>state.WarningMessage.mode
        })
    }
}
</script>
<style scoped>
#warning-message {
    position:fixed;
    background: rgba(127,127,127,0.8);
    border-radius:8px;
    text-align:center;
    font-weight:bold;
    font-size:1.3em;
    display:flex;
    flex-direction:row;
    padding:10px;
}
#warning-message .icon,
#warning-message .message {
    margin:auto 0;
}
</style>