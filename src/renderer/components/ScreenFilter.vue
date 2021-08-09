<template>
    <div id="screen-filter" :class="{hidden:!isScreenFilterOn}">
        <div id="blue-light" :style="{background:`rgba(255,219,0,${blueLightFigure})`}"></div>
        <div id="darkness" :style="{background:`rgba(0,0,0,${darkness})`}"></div>
    </div>
</template>

<script>
import setting from '/setting.json'
import { ipcRenderer as ipc } from 'electron'
export default {
    name:'ScreenFilter',
    data(){
        return {
            isScreenFilterOn: false,
            blueLightFigure: 0,
            darkness: 0
        }
    },
    mounted(){
        this.isScreenFilterOn = setting.screenFilter.show;
        this.blueLightFigure = setting.screenFilter.blueLightFigure;
        this.darkness = setting.screenFilter.darkness;
        ipc.on('SET_FILTER_SHOW',(evt,payload)=>{
            this.isScreenFilterOn = payload;
        })
        ipc.on('SET_BLUELIGHTFIGURE',(evt,payload)=>{
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
    transition:opacity 1s ease-in-out;
    opacity:1;
}
#screen-filter.hidden {
    opacity:0;
    transition:opacity 1s ease-in-out;
}
#blue-light {
    position:absolute;
    height:100%;
    width:100%;
    transition:all 0.5s ease-in-out;
}
#darkness {
    position:absolute;
    height:100%;
    width:100%;
    transition:all 0.5s ease-in-out;
}
</style>