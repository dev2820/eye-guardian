<template>
    <span class="toggle">
        <label class="switch">
            <input type="checkbox" @change="handler($event)" :checked="checked"/>
            <span class="slider round"></span>
        </label>
    </span>
</template>

<script>
export default {
    name: 'toggle',
    props:{
        'checked':{
            type: Boolean,
            default: false
        }
    },
    methods: {
        handler(event){
            const isToggleOn = event.target.checked;
            if(isToggleOn) {
                this.$emit('on');
            }
            else {
                this.$emit('off');
            }
        }
    }
}
</script>

<style scoped>
.switch {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
}

.switch input[type=checkbox] { 
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .3s;
    transition: .3s;
}
.slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    -webkit-transition: 0.3s;
    transition: 0.3s;
}
input[type=checkbox]:checked + .slider {
    background-color: var(--primary-color);
}

input[type=checkbox]:focus + .slider {
    box-shadow: 0 0 1px var(--primary-color);
}

input[type=checkbox]:checked + .slider:before {
    -webkit-transform: translateX(16px);
    -ms-transform: translateX(16px);
    transform: translateX(16px);
}

/* Rounded sliders */
.slider.round {
    border-radius: 11px;
}

.slider.round:before {
    border-radius: 50%;
}
</style>
