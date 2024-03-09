<template>
  <div class="setting">
    <a-form ref="formRef" :model="setting" @submit="handleSubmit">
      <a-divider orientation="center"> 抓取影片设置 </a-divider>
      <a-form-item field="spiderTime" label="抓取频率">
        <a-radio-group v-model="setting.spiderTime" type="button">
          <a-radio :value="7">7天</a-radio>
          <a-radio :value="15">15天</a-radio>
          <a-radio :value="30">30天</a-radio>
          <a-radio :value="-1">所有</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-divider orientation="center"> 全网搜索显示设置 </a-divider>
      <a-form-item field="netWorkShowNumber" label="显示条数">
        <a-radio-group v-model="setting.netWorkShowNumber" type="button">
          <a-radio :value="1">1条</a-radio>
          <a-radio :value="5">5条</a-radio>
          <a-radio :value="10">10条</a-radio>
          <a-radio :value="-1">所有</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted } from "vue";
import useStore from "../store/setting";
const store = useStore();
const { $mitt } = getCurrentInstance().appContext.config.globalProperties;
function useSeeting() {
  const setting = ref({
    spiderTime: store.$state.spiderTime,
    netWorkShowNumber: store.$state.netWorkShowNumber,
  });
  //   表单提交方法
  const handleSubmit = function () {};
  // 监听保存事件
  const initMitt = function () {
    $mitt.on("saveSetting", () => {
      store.saveSetting(setting.value);
    });
  };
  return {
    setting,
    handleSubmit,
    initMitt,
  };
}

const { setting, handleSubmit, initMitt } = useSeeting();
onMounted(() => {
  initMitt();
});
</script>

<style lang="scss" scoped></style>
