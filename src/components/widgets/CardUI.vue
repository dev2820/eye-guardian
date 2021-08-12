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
    height:100px;
    margin:0 20px 20px 0;
    border-radius:4px;
    padding:10px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
}
</style>