<template>
  <div
    class="app"
    @mouseenter="mouseenter"
    @mouseleave="mouseleave"
    @mousedown="mousedown"
    @mouseup="mouseup"
  >
    <router-view></router-view>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

import { sendWindowRagEvent } from "./utils/sendMessage";
import { initBaseData } from "./utils/init";
import useStore from "./store/setting";
const { ipcRenderer } =require("electron");

const store = useStore();
/**
 * 拖动事件
 */
function useDrag() {
  let enterFlag = false;
  // 鼠标按压判断，只有鼠标进入范围内，并且按压状态，此时释放鼠标才会关闭窗口移动
  let mousedownFlag = false;
  let timer = null;
  /**鼠标按压 */
  function mousedown() {
    if (enterFlag) {
      sendWindowRagEvent(true);
      mousedownFlag = true;
    }
  }
  /**鼠标释放 */
  function mouseup() {
    if (enterFlag && mousedownFlag) {
      sendWindowRagEvent(false);
      mousedownFlag = false;
    }
  }

  /**鼠标移入 */
  function mouseenter() {
    enterFlag = true;
  }

  /**鼠标移出 */
  function mouseleave() {
    enterFlag = false;
    // 避免卡顿的情况下，鼠标滑出移动范围，但窗口仍跟随鼠标移动
    if (timer !== null) {
      timer = setTimeout(() => {
        mousedownFlag = false;
        sendWindowRagEvent(false);
        timer = null;
      }, 1000);
    }
  }

  return {
    mousedown,
    mouseenter,
    mouseleave,
    mouseup,
  };
}

// 初始化基础数据
function initData() {
  let mode = store.$state.mode;
  if (mode == "db") {
    // 初始化基础数据
    initBaseData(mode);
  }
}

const { mousedown, mouseenter, mouseleave, mouseup } = useDrag();
onMounted(() => {
  initData();

});
</script>

<style lang="scss">
@import url("./assets/css/styles.scss");
.app {
  width: 100vw;
  height: 100vh;
}
</style>
