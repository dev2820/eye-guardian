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
    background-color:var(--primary-color);
    color:var(--text-regular-color);
    border:1px solid var(--primary-color);
    border-radius:4px;
    padding:5px;
    cursor: pointer;
    transition:all 0.3s;
    box-shadow: 0 6px 6px rgba(0,0,0,0.19);
}
button:hover {
    transition:all 0.3s;
    background-color:var(--primary-color);
    box-shadow:0 6px 6px rgba(0,0,0,0.19), 0 6px 12px rgba(0,0,0,0.23);
}
</style>