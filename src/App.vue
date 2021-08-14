<template>
  <router-view/>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Nanum_Gothic', 'Times New Roman', Times, serif;
}
:root {
  /*another green 01D503 */
  --primary-color:#67C23A;
  --primary-color-light:#c2e7b0;
  --title-color:#32353B;
  --background-color:#32353B;
  --success-color:#67C23A;
  --warning-color:#E6A23C;
  --danger-color:#F56C6C;
  --ongoing-color:#E6A23C;
  /* --text-regular-color:#606266; */
  --text-regular-color:#E4E7ED;
  --light-gray:#909399;
}
html,body,#app {
  height:100%;
  width:100%;
  overflow:hidden;
}
@font-face { 
  font-family: 'Nanum_Gothic';
  src: local('Nanum-Gothic'), url('./assets/fonts/Nanum_Gothic/NanumGothic-Regular.ttf');
}
</style>
