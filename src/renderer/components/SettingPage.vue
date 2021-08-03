<template>
    <div>
        <h2>setting page</h2>
        <span>{{main}}</span>
        <button @click="increase">state increase</button>
        <button @click="decrease">state decrease</button>
        {{isBlueLightFilterOn}}
        <button @click="showBlueLightFilter(true)">BlueLightFilter on</button>
        <button @click="showBlueLightFilter(false)">BlueLightFilter off</button>
        <font-awesome-icon icon="question-circle" class="icon" @mouseenter="showGuideText($event,'guide1')" @mouseleave="hideGuidText()"/>
        <tooltip :show="showGuide" :message="guideText" :position="guidePosition"></tooltip>
    </div>
</template>

<script>
import { ipcRenderer as ipc} from 'electron'
import { mapState,mapMutations,mapActions } from 'vuex'
import Tooltip from './Tooltip.vue'
export default {
    data(){
        return {
            guideText:'',
            showGuide:false,
            guidePosition: {
                top:0,
                left:0
            }
        }
    },
    components: { 
        Tooltip 
    },
    mounted(){
        ipc.on('BLUELIGHT_FILTER_CONTROL',(e,payload)=>{
            this.showBlueLightFilter(payload);
        })
    },
    computed: {
        ...mapState({
            main: state=>state.Counter.main,
            isBlueLightFilterOn: state=>state.BlueLightFilter.show
        })
    },
    methods: {
        ...mapActions(['showBlueLightFilter,hideBlueLightFilter']),
        showBlueLightFilter(boolean){
            if(boolean){
                this.$store.dispatch('showBlueLightFilter');
            }
            else {
                this.$store.dispatch('hideBlueLightFilter');
            }
        },
        increase(){
            this.$store.dispatch('someAsyncTask')
        },
        decrease(){
            this.$store.dispatch('someAsyncTask')
        },
        showGuideText(e,guideType) {
            this.guidePosition.top=e.screenY;
            this.guidePosition.left=e.screenX;
            switch(guideType) {
                case 'guide1': {
                    this.guideText='guide1에 대한 가이드라인입니다.';
                    break;
                }
            }
            this.showGuide=true;
        },
        hideGuidText(){
            this.showGuide=false;
        }
    }
}
</script>

<style>

</style>