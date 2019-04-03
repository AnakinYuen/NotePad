<template>
  <div id="app"></div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class App extends Vue {}
</script>

<style lang="scss">
@import "~normalize.css";

* {
  box-sizing: border-box;
}

body {
  height: 100vh;
  width: 100vw;
}
</style>
