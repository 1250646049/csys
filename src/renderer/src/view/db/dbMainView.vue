<template>
  <div class="dbMain">
    <HeaderCom :show-other="false" :req-max="false" />
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { defineComponent } from "vue";
import HeaderCom from "../../components/HeaderCom.vue";
defineComponent({
  HeaderCom,
});
</script>

<style lang="scss" scoped>
.content {
  background: #2e2e36;
  min-height: 100vh;
  width: 100vw;
  padding: 40px 10px 0px 10px;
  box-sizing: border-box;
}
</style>
