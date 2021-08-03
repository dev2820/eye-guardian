<template>
    <div>
        <h2>setting page</h2>
        <span>{{main}}</span>
        <button @click="increase">state increase</button>
        <button @click="decrease">state decrease</button>
        {{isBlueLightFilterOn}}
        <button @click="showBlueLightFilter(true)">BlueLightFilter on</button>
        <button @click="showBlueLightFilter(false)">BlueLightFilter off</button>
    </div>
</template>

<script>
import { ipcRenderer as ipc} from 'electron'
import { mapState,mapMutations,mapActions } from 'vuex'
export default {
    data(){
        return {

        }
    },
    mounted(){
        // console.log(this.$store.state)
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
        }
    }
}
</script>

<style>

</style>