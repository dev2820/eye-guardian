<template>
    <div id="screen-filter" :class="{hidden:!isScreenFilterOn}">
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
            isScreenFilterOn: state=>state.ScreenFilter.show
        })
    }
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
</style>