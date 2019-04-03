<template>
  <div class="icon" @click="$emit('click')">
    <div class="icon__triangle"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Icon extends Vue {}
</script>

<style scoped lang="scss">
.icon {
  position: relative;

  border: 1px solid #000;
  width: 31px;
  height: 32px;

  background: #fff;

  &::before {
    content: "";

    position: absolute;
    top: -3px;
    left: 5px;

    box-shadow: 6px 0px #000, 12px 0px #000, 18px 0px #000;
    border-left: 1px solid #000;
    width: 0;
    height: 5px;
  }

  &::after {
    content: "";

    position: absolute;
    bottom: 3px;
    right: 0;

    border-top: 1px solid #000;
    width: 22px;
  }

  &__triangle {
    position: absolute;
    bottom: 3px;
    left: -1px;

    border: 0 solid transparent;
    border-bottom: 8px solid transparent;
    border-right: 8px solid #000;
    width: 0;
    height: 0;

    &::after {
      content: "";

      position: absolute;
      top: 1px;
      right: -7px;

      border: 0 solid transparent;
      border-bottom: 5px solid transparent;
      border-right: 5px solid #fff;
      width: 0;
      height: 0;
    }
  }
}
</style>
