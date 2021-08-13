<template>
    <span class="custom-check-box">
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
span.custom-check-box {
    position:relative;
    display:inline-flex;
}
label.switch {
    margin:auto 0;
    position:relative;
    display:inline-flex;
}
label.switch input[type=checkbox] { 
    opacity: 0;
    width: 0;
    height: 0;
    margin:auto 0;
}
label.switch input[type=checkbox] + span.box{ 
    display:inline-block;
    width:16px;
    height:16px;
    border:2px solid red;
    margin:auto 0;
}
label.switch input[type=checkbox]:checked + span.box {
    background-position:center;
    background:radial-gradient(red,red 3px, transparent 5px,transparent 100%);
}
.round {
    border-radius:50%;
}
</style>