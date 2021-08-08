<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'eye-guardian'
  }
</script>

<style>
  /* CSS */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Nanum_Gothic', 'Times New Roman', Times, serif;
}
@font-face { 
  font-family: 'Nanum_Gothic';
  src: url('./assets/fonts/Nanum_Gothic/NanumGothic-Regular.ttf');
}
</style>
