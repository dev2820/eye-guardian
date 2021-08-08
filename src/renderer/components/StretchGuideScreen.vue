<template>
    <div>
        <h2>strecth guide</h2>
        <div class="background">
            <video ref="stretchVideo" :src="stretchGuideVideo"></video>
        </div>
    </div>
</template>

<script>
import { ipcRenderer as ipc } from 'electron'
export default {
    name: 'stretch-guide-screen',
    data(){
        return {
            stretchGuideVideo: require('@/assets/videos/stretch.mp4')
        }
    },
    mounted() {
        // setTimeout(()=>{//추후, 비디오가 끝나면 closeStretchGuide를 실행하도록 수정
        //     // this.closeStretchGuide();
        // },5000)
        const videoEl = this.$refs['stretchVideo'];
        // videoEl.addEventListener('play',()=>{
        //     console.log('play')
        // });
        videoEl.addEventListener('ended',()=>{//플레이가 끝나면
            // console.log('ended')
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
    background: #333333;
}
</style>