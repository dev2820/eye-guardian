<template>
    <span class="custom-input-check-box">
        <label class="switch">
            <input type="checkbox" @click="handler" :checked="checked"/>
            <span class="box">
                <span class="checked">
                    <font-awesome-icon class="icon" icon="check"/>
                </span>
            </span>
        </label>
    </span>
</template>

<script>
export default {
    name: "CustomInputCheckBox",
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
span.custom-input-check-box {
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
    position:relative;
    display:inline-flex;
    width:16px;
    height:16px;
    border-radius:4px;
    border:2px solid var(--primary-color);
    margin:auto 0;
}
label.switch input[type=checkbox] + span.box .checked {
    position:absolute;
    width:8px;
    height:8px;
    border-radius:2px;
    left:50%;
    top:50%;
    margin-left:-4px;
    margin-top:-4px;
    background: transparent;
}
/* label.switch input[type=checkbox]:checked + span.box .checked {
    background: var(--primary-color); 
} */
label.switch input[type=checkbox] + span.box .checked .icon {
    font-size:0.5em; 
    color:var(--primary-color);
    position:absolute;
    top:0;
    opacity:0;
}
label.switch input[type=checkbox]:checked + span.box .checked .icon {
    opacity:1;
}
.round {
    border-radius:50%;
}
</style>