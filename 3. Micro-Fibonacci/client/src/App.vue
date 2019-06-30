<template>
  <div id="app">
    <fibonacci-main></fibonacci-main>
  </div>
</template>

<script>
import fibonacciMain from './components/Fibonacci.vue'

export default {
  name: 'app',
  components: {
    fibonacciMain
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
