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

</style>