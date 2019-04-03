<template>
  <div id="app">
    <Icon />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Icon from "./components/Icon.vue";

@Component<App>({
  components: {
    Icon,
  },
})
export default class App extends Vue {}
</script>

<style lang="scss">
@import "~normalize.css";

* {
  box-sizing: border-box;
}

body {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100vw;
  height: 100vh;
}
</style>
