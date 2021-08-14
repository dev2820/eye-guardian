<template>
    <span class="custom-input-radio">
        <label class="switch">
            <input type="radio" @click="handler" :checked="checked"/>
            <span class="box round">
                <span class="checked round"></span>
            </span>
        </label>
    </span>
</template>

<script>
export default {
    name: "CustomInputRadio",
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
span.custom-input-radio {
    position:relative;
    display:inline-flex;
}
label.switch {
    margin:auto 0;
    position:relative;
    display:inline-flex;
}
label.switch input[type=radio] { 
    opacity: 0;
    width: 0;
    height: 0;
    margin:auto 0;
}
label.switch input[type=radio] + span.box{ 
    position:relative;
    display:inline-flex;
    width:16px;
    height:16px;
    border:2px solid var(--primary-color);
    margin:auto 0;
}
label.switch input[type=radio] + span.box .checked {
    position:absolute;
    width:8px;
    height:8px;
    left:50%;
    top:50%;
    margin-left:-4px;
    margin-top:-4px;
    background: transparent;
}
label.switch input[type=radio]:checked + span.box .checked {
    background: var(--primary-color);
}
.round {
    border-radius:50%;
}
</style>