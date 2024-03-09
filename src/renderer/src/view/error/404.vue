<template>
  <div class="error">
    <headercom :showOther="false" />
    <!-- content -->
    <div class="contents">服务已经被暂停,请等待系统恢复~</div>
  </div>
</template>

<script setup>
import { defineComponent, ref } from "vue";
import headercom from "../../components/headercom.vue";

defineComponent({
  headercom,
});

function useError() {
  const animation = ref(null);

  return {
    animation,
  };
}

const { animation } = useError();
</script>

<style lang="scss" scoped>
.error {
  background: #2e2e36;
  width: 100vw;
  height: 100vh;
  .contents {
    text-align: center;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 26px;
    color: white;
    font-weight: bold;
  }
}
</style>
