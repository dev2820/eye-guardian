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
  --title-color:#2e2c29;
  --background-color:#fff;
  --success-color:#67C23A;
  --warning-color:#E6A23C;
  --danger-color:#F56C6C;
  --ongoing-color:#E6A23C;
  --text-regular-color:#606266;
  --light-gray:#909399;
}
html,body,#app {
  height:100%;
  width:100%;
}
@font-face { 
  font-family: 'Nanum_Gothic';
  src: local('Nanum-Gothic'), url('./assets/fonts/Nanum_Gothic/NanumGothic-Regular.ttf');
}
</style>
