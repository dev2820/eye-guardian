<template>
    <div class="background">
        <video ref="stretchVideo" src="local-video://videos/Stretch.mp4" type="video/mp4"></video>
    </div>
</template>

<script>
import { ipcRenderer as ipc } from 'electron'
export default {
    name: 'stretch-guide-screen',
    data(){
        return {
            isplay:false,
            isended:false
        }
    },
    mounted() {
        const videoEl = this.$refs['stretchVideo'];
        videoEl.addEventListener('play',()=>{
            this.isplay=true;
        })
        videoEl.addEventListener('ended',()=>{//플레이가 끝나면
            // console.log('ended')
            this.isended=true;
            this.closeStretchGuide();
        });
        ipc.on('PLAY_STRETCH_GUIDE',()=>{//플레이 시작 message
            videoEl.play();
        })
    },
    methods:{
        closeStretchGuide(){
            ipc.send('HIDE_STRETCH_GUIDE',true);
        }
    }
}
</script>

<style>
.background {
    width:100%;
    height:100%;
    background: #333333;
}
video {
    position:absolute;
    left:50%;
    margin-left: -350px;
    top:50%;
    margin-top:-250px;
    width:700px;
    height:500px;
}
</style>