<template>
    <span v-if="status==='complete'" class="dot complete"></span>
    <span v-else-if="status==='failed'" class="dot failed"></span>
    <span v-else-if="status==='ongoing'" class="dot ongoing"></span>
</template>

<script>
export default {
    props: {
        status:{
            type:String,
            require:true
        }
    }
}
</script>

<style scoped>
.dot {
    box-sizing:border-box;
    width:6px;
    height:6px;
    border-radius:50%;
}
.complete {
    background-color:var(--success-color);
}
.failed {
    background-color:var(--danger-color);
}
.ongoing {
    background-color:var(--ongoing-color);
    animation:flash 1s infinite;
}
@keyframes flash {
    0%{
        opacity:1;
    }
    50%{
        opacity:0;
    }
    100%{
        opacity:1;
    }
}
</style>