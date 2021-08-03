<template>
    <div>
        <h2>setting page</h2>
        <span>{{main}}</span>
        <button @click="increase">state increase</button>
        <button @click="decrease">state decrease</button>
        {{isBlueScreenOn}}
        <button @click="showBlueScreen(true)">bluescreen on</button>
        <button @click="showBlueScreen(false)">bluescreen off</button>
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
        ipc.on('BLUESCREEN_CONTROL',(e,payload)=>{
            this.showBlueScreen(payload);
        })
    },
    computed: {
        ...mapState({
            main: state=>state.Counter.main,
            isBlueScreenOn: state=>state.BlueScreen.show
        })
    },
    methods: {
        ...mapActions(['showBlueScreen,hideBlueScreen']),
        showBlueScreen(boolean){
            if(boolean){
                this.$store.dispatch('showBlueScreen');
            }
            else {
                this.$store.dispatch('hideBlueScreen');
            }
        },
        increase(){
            this.$store.dispatch('someAsyncTask')
        },
        decrease(){
            console.log(this.main)
            this.$store.dispatch('someAsyncTask')
        }
    }
}
</script>

<style>

</style>