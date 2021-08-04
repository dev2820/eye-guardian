<template>
    <div id="screen-filter" :class="{hidden:!isScreenFilterOn}">
        <div id="blue-light" :style="{background:`rgba(255,219,0,${blueLightFigure})`}"></div>
        <div id="darkness" :style="{background:`rgba(0,0,0,${darkness})`}"></div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name:'ScreenFilter',
    data(){
        return {

        }
    },
    computed: {
        ...mapState({
            isScreenFilterOn: state=>state.ScreenFilter.show,
            blueLightFigure: state=>state.ScreenFilter.blueLightFigure,
            darkness: state=>state.ScreenFilter.darkness,
        })
    },
}
</script>
<style scoped>
#screen-filter {
    height:100vh;
    width:100vw;
    background:rgba(255,219,0,0.15);
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
}
#darkness {
    position:absolute;
    height:100%;
    width:100%;
}
</style>