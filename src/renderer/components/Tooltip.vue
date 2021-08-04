<template>
    <div id="tooltip" :class="{show:show}" :style="{left:tooltipLeft,top:tooltipTop}">
        <slot></slot>
        {{tooltipLeft}}
        {{tooltipTop}}
        <span class="tail">▼</span>
    </div>
</template>

<script>
export default {
    name: 'Tooltip',
    props: {
        show: {
            type:Boolean,
            default:()=>false
        },
        position: {
            type:Object,
            default:()=>{
                return {
                    left:0,
                    top:0
                }
            }
        },
    },
    computed:{
        tooltipLeft(){
            return (this.position.left-100)+'px'
        },
        tooltipTop(){
            return (this.position.top)+'px'
        }
    }
}
</script>

<style scoped>
#tooltip {
    position:fixed;
    opacity:0;
    transition:opacity 0.3s ease-in-out;
    background-color:#ffdb00;
    padding:10px;
    border-radius:8px;
    pointer-events: none;
    width:200px;
}
#tooltip.show {
    opacity:1;
    transition:opacity 0.3s ease-in-out;
}
.tail {
    position:absolute;
    color:#ffdb00;
    left:50%;
    margin-left:-0.86rem;
    top:38px;
}
</style>