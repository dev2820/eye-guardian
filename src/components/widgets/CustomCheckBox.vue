<template>
    <span>
        <label class="switch">
            <input type="checkbox" @click="handler" :checked="checked"/>
            <span class="box round"></span>
        </label>
    </span>
</template>

<script>
export default {
    name: "CustomCheckBox",
    props: {
        checked: {
            type:Boolean,
            default() {
                return false;
            }
        }
    },
    methods:{
        handler() {
            if(this.checked) {
                this.$emit('off');
            }
            else {
                this.$emit('on');
            }
        }
    }
}
</script>

<style scoped>
label.switch input[type=checkbox] { 
    opacity: 0;
    width: 0;
    height: 0;
}
label.switch input[type=checkbox] + span.box{ 
    position: absolute;
    width:16px;
    height:16px;
    border:2px solid red;
}
label.switch input[type=checkbox]:checked + span.box {
    background-position:center;
    background:radial-gradient(red,red 3px, white 5px,white 100%);
}
.round {
    border-radius:50%;
}
</style>