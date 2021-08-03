<template>
    <div id="tooltip" :class="{show:show}">
        {{message}}
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
                    x:0,
                    y:0
                }
            }
        },
        message:{
            type:String,
            default:()=>''
        }
    },
    mounted(){
        this.$el.style.left=(this.position.left)+'px';
        this.$el.style.top=(this.position.top)+'px'
    }
}
</script>

<style>
#tooltip {
    position:fixed;
    opacity:0;
    transition:opacity 0.3s ease-in-out;
    background-color:#ffdb00;
    padding:10px;
    border-radius:8px;
}
#tooltip.show {
    opacity:1;
    transition:opacity 0.3s ease-in-out;
}
.tail {
    position:absolute;
    color:#ffdb00;
    left:50%;
    margin-left:-1em;
    top:38px;
}
</style>