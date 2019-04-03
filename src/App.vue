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
  $bg-color: rgba(0, 0, 0, 0.5);

  justify-content: center;
  align-items: center;

  display: flex;

  width: 100vw;
  height: 100vh;

  background-position: 0 0, 1px 1px;
  background-size: 2px 2px;
  background-color: #fff;
  background-image: linear-gradient(
      45deg,
      $bg-color 25%,
      transparent 25%,
      transparent 75%,
      $bg-color 75%
    ),
    linear-gradient(
      45deg,
      $bg-color 25%,
      transparent 25%,
      transparent 75%,
      $bg-color 75%
    );
}
</style>
