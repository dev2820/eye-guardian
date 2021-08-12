<template>
    <div id="title-bar">
        <img id="main-icon" src="../assets/images/logo.png"/>
        <small id="title">{{title}}</small>
        <span class="menus">
            <button @click="minimizeWindow" id="minimize">
                <font-awesome-icon class="icon" :icon="['far','window-minimize']"/>
            </button>
            <button @click="maximizeWindow" id="maximize">
                <font-awesome-icon class="icon" :icon="['far','square']"/>
            </button>
            <button @click="closeWindow" id="close">
                <font-awesome-icon class="icon" icon="times"/>
            </button>
        </span>
    </div>
</template>

<script>
export default {
    name: 'TitleBar',
    props: {
        title:{
            type:String,
            require:true
        }
    },
    methods: {
        minimizeWindow() {
            this.$emit('minimize');
        },
        maximizeWindow() {
            this.$emit('maximize');
        },
        closeWindow() {
            this.$emit('close');
        }
    }
}
</script>

<style>
#title-bar {
    -webkit-app-region: drag;
    background-color:var(--title-color);
    color:var(--text-regular-color);
    width:100%;
    height:30px;
    display:flex;
}
#main-icon {
    width:18px;
    height:18px;
    margin:auto 5px auto 6px;
}
.menus {
    width:135px;
}
.menus > button {
    color:var(--text-regular-color);
    -webkit-app-region: no-drag;
    background:transparent;
    border:none;
    font-size:0.7em;
    width:45px;
    height:30px;
    padding:7px;
    transition:all 0.1s;
}
.menus > button:hover {
    background:var(--light-gray);
}
.menus > button:hover:last-child {
    background-color:var(--danger-color);
    color:white;
} 
#title {
    flex-grow:1;
    margin:auto 0;
}
</style>