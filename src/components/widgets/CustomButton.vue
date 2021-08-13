<template>
    <button>
        <slot></slot>
    </button>
</template>

<script>
export default {
    name: "CustomInputNumber",
}
</script>

<style scoped>
button {
    padding:5px;
}
</style>