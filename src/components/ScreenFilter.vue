<template>
    <div id="screen-filter">
        <div id="blue-light" :class="{'hidden':!isBlueLightFilterOn}" :style="{background:`rgba(255,219,0,${blueLightFigure})`}"></div>
        <div id="darkness" :style="{background:`rgba(0,0,0,${darkness})`}"></div>
    </div>
</template>

<script>
// import setting from '../assets/setting.json'
import { ipcRenderer as ipc } from 'electron'
// import fs from 'fs'
export default {
    name:'ScreenFilter',
    data(){
        return {
            isBlueLightFilterOn: false,
            blueLightFigure: 0,
            darkness: 0
        }
    },
    mounted(){
        ipc.send('REQUEST_INIT_SCREEN_VALUE','screenFilter');
        ipc.on('INIT',(evt,payload)=>{
            this.isBlueLightFilterOn = payload.screenFilter.isBlueLightFilterOn;
            this.blueLightFigure = payload.screenFilter.blueLightFigure;
            this.darkness = payload.screenFilter.darkness;
        })

        ipc.on('SET_BLUELIGHT_FILTER_SHOW',(evt,payload)=>{
            this.isBlueLightFilterOn = payload;
        })
        ipc.on('SET_BLUELIGHT_FIGURE',(evt,payload)=>{
            this.blueLightFigure = payload;
        })
        ipc.on('SET_DARKNESS',(evt,payload)=>{
            this.darkness = payload;
        })
    },
}
</script>
<style scoped>
#screen-filter {
    height:100vh;
    width:100vw;
}
#blue-light,
#darkness {
    position:absolute;
    width:100%;
    height:100%;
    transition:opacity 0.5s ease-in-out;
    opacity:1;
}
#blue-light.hidden,
#darkness.hidden {
    opacity:0;
    transition:opacity 0.5s ease-in-out;
}
</style>