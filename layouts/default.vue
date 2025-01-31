<template>
  <div>
    <Navigation />
    <Nuxt />
  </div>
</template>

<script>
import Navigation from '~/components/Navigation.vue'

export default {
  components: {
    Navigation
  }
}
</script>

<style>
html {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  box-sizing: border-box;
  background-color: #f8f9fa;
}

body {
  background-color: #f8f9fa;
  color: #2c3e50;
}

*, *:before, *:after {
  box-sizing: border-box;
  margin: 0;
}
</style>
