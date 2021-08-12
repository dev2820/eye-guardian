<template>
    <div class="select">
        <button v-for="(value,index) in options" :key="index"
            :value="value"
            :class="{selected:value===checked}"
            @click="selectOption($event)"
        >
        {{value}}
        </button>
    </div>
</template>

<script>
export default {
    name:'Select',
    props: {
        options: Array,
        checked: String
    },
    methods:{
        selectOption(e){
            this.$emit('select',e);
        }
    }
}
</script>

<style scoped>
.select {
    display:flex;
    flex-direction:row;
}
.select button {
    width:120px;
    height:30px;
    text-align:center;
    border:1px solid black;
    cursor:pointer;
}
.select button.selected {
    background:#111111;
    color:white;
}
</style>