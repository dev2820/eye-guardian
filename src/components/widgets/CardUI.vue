<template>
<div class="card">
    <slot></slot>
</div>
</template>

<script>
export default {

}
</script>

<style>
.card {
    width:280px;
    height:125px;
    margin:0 20px 10px 0;
    border-radius:4px;
    padding:10px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
    transition:0.3s;
}
.card:hover {
    transition:0.3s;
    transform:translateY(-5px);
}
</style>