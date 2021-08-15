<template>
    <div class="select">
        <span class="option" v-for="(value,index) in options" :key="index">
            <custom-input-radio
                :value="value"
                :checked="checked===value"
                :class="{selected:value===checked}"
                @click.capture="selectOption($event,value)"
            />
            <p class="value">{{value}}</p>
        </span>
    </div>
</template>

<script>
import CustomInputRadio from './CustomInputRadio.vue';
export default {
    name:'Select',
    components: {
        CustomInputRadio
    },
    props: {
        options: Array,
        checked: String
    },
    methods:{
        selectOption(e,value){
            e.stopPropagation();
            e.target.value=value;
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
.select > .option {
    display:flex;
    flex-direction:row;
    height:30px;
    margin-right: 10px;
}
.select > .option > * {
    margin: auto 0;
}
.select > .option > .value {
    margin-left:5px;
    margin-bottom:7px;
}
</style>