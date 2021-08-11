<template>
    <input type="number" 
        :value="value"
        @change="change($event)" 
        :min="min" 
        :max="max"/>
</template>

<script>
export default {
    name: "CustomInputNumber",
    props:{
        value: {
            type:Number,
            default() {
                return 1;
            }
        },
        min:{
            type:Number,
            default() {
                return 1;
            }
        },
        max:{
            type:Number,
            default() {
                return 10;
            }
        }
    },
    methods: {
        change(event){
            this.$emit('change',event);
        }
    }
}
</script>

<style scoped>

</style>