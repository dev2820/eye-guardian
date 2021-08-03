<template>
    <div id="blue-light-filter" :class="{hidden:!isBlueLightFilterOn}">
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name:'blue-light-filter',
    data(){
        return {

        }
    },
    computed: {
        ...mapState({
            isBlueLightFilterOn: state=>state.BlueLightFilter.show
        })
    }
}
</script>
<style scoped>
#blue-light-filter {
    height:100vh;
    width:100vw;
    background:rgba(255,219,0,0.15);
    transition:opacity 1s ease-in-out;
    opacity:1;
}
#blue-light-filter.hidden {
    opacity:0;
    transition:opacity 1s ease-in-out;
}
</style>