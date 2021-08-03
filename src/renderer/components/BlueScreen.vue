<template>
    <div id="blue-screen" :class="{hidden:!isBlueScreenOn}">
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name:'blue-screen',
    data(){
        return {

        }
    },
    computed: {
        ...mapState({
            isBlueScreenOn: state=>state.BlueScreen.show
        })
    }
}
</script>
<style scoped>
#blue-screen {
    height:100vh;
    width:100vw;
    background:rgba(255,219,0,0.15);
    transition:opacity 1s ease-in-out;
    opacity:1;
}
#blue-screen.hidden {
    opacity:0;
    transition:opacity 1s ease-in-out;
}
</style>