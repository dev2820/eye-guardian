<template>
    <span class="tooltip">
        <span ref="alt" class="alt">
            {{alt}}
            <span class="tail">▼</span>
        </span>
        <slot></slot>
    </span>
</template>

<script>
export default {
    name: 'Tooltip',
    props: {
        alt: {
            type:String,
            require:true
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
    mounted(){
        const altEl = this.$el.querySelector('.alt');
        const altBound = altEl.getBoundingClientRect();
        const bound = this.$el.getBoundingClientRect();
        altEl.style.left=`${bound.left}px`
        altEl.style.marginLeft=`-${altBound.width/2-bound.width/2}px`
        altEl.style.marginTop=`-${altBound.height+5}px`
    },
    updated(){
        const altEl = this.$el.querySelector('.alt');
        const altBound = altEl.getBoundingClientRect();
        const bound = this.$el.getBoundingClientRect();
        altEl.style.left=`${bound.left}px`
        altEl.style.marginLeft=`-${altBound.width/2-bound.width/2}px`
        altEl.style.marginTop=`-${altBound.height+5}px`
    }
}
</script>

<style scoped>
.tooltip {
    cursor: pointer;
}
.tooltip > .alt {
    position:fixed;
    pointer-events:none;
    background-color:#ffdb00;
    opacity:0;
    padding:8px;
    border-radius:8px;
    max-width:300px;
    transition:opacity 0.3s ease-in-out;
}
.tooltip:hover > .alt {
    opacity:1;
    transition:opacity 0.3s ease-in-out;
}
.tail {
    width:20px;
    text-align:center;
    position:absolute;
    color:#ffdb00;
    left:50%;
    margin-left:-10px;
    top:100%;
    margin-top:-5px;
}
</style>