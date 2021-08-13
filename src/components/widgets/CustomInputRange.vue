<template>
    <input type="range" 
        :value="value"
        :min="min"
        :max="max"
        :step="step"
    />
</template>

<script>
export default {
    props: {
        value:{
            type: Number,
            default(){
                return 0;
            }
        },
        min: {
            type: Number,
            default(){
                return 0;
            }
        },
        max: {
            type: Number,
            default(){
                return 100;
            }
        },
        step: {
            type: Number,
            default(){
                return 1;
            }
        },
    },
    methods: {
        handler(event){
            event.preventDefault();
            this.$emit('change',event);
        }
    }
}
</script>

<style>
input[type=range] { 
    height:10px;
    -webkit-appearance: none; 
    background: transparent; 
}
input[type=range]:focus { 
    outline: none; 
}
input[type=range]::-webkit-slider-runnable-track {
    width:100%;
    height:2px;
    /* background:#3071a9; */
    background-color:#2196F3;
}
input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width:14px;
    height:14px;
    margin-top:-6px;
    border-radius:50%;
    background-color:#fff;
    box-shadow: 0px 2px 1px #999,
                2px 0px 1px #999,
                0px -2px 1px #999,
                -2px 0px 1px #999;
    
}
input[type=range]:disabled::-webkit-slider-runnable-track,
input[type=range]:disabled::-webkit-slider-thumb {
    background-color:#999999;
}
</style>