<template>
    <div id="loading-page">
        <img class="loading-image" src="../assets/images/loading.gif"/>
        <span class="loading-message">{{message}}{{dot}}</span>
    </div>
</template>

<script>
export default {
    name:'LoadingPage',
    data(){
        return {
            message:'loading',
            dot:'.'
        }
    },
    mounted(){
        const plusDot = ()=>{
            if(this.dot.length>2){ this.dot='.'; }
            else { this.dot += '.' }
            setTimeout(plusDot,200)
        }
        setTimeout(plusDot,200)
    }
}
</script>

<style>
#loading-page {
    position:absolute;
    display:flex;
    flex-direction:column;
    width:250px;
    height:300px;
    left:50%;
    top:50%;
    margin-left:-125px;
    margin-top:-150px;
    border-radius:4px;
    background-color: var(--background-color);
    box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
}
.loading-message {
    width:70px;
    margin:20px auto;
}
.loading-image {
    margin:0 auto;
    width:200px;
    height:200px;
}
</style>