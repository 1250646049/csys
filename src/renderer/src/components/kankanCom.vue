<template>
  <div class="kan" v-if="lists.length">
    <KankanItem :data="item" v-for="(item, index) in lists" :key="index" />
  </div>
  <div class="kan_no" v-else style="text-align: center; color: #000">
    正在全网搜索中.....
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  defineComponent,
  defineProps,
  watch,
  onBeforeUnmount,
} from "vue";
import KankanItem from "./KankanItem.vue";
const { ipcRenderer } = require("electron");

const props = defineProps({
  vodName: {
    type: String,
    required: true,
    default: "",
  },
});
defineComponent({
  KankanItem,
});

function useKankan() {
  const lists = ref([]);
  const initListenerEvent = function () {
    // 监控查询结果返回
    ipcRenderer.on("getSpiderBy360Event", (_, data) => {
      let reslut = JSON.parse(data);
      if (reslut && reslut.length != 0) {
        // lists.value = [...reslut];
        lists.value = [...reslut];
      }
    });
  };
  // 发送搜索事件
  const sendSearch2DbWindows = (vodName = props.vodName) => {
    // 触发子窗口搜索
    lists.value = [];
    ipcRenderer.send("sendSpiderBy360Event", vodName);
  };
  return {
    initListenerEvent,
    sendSearch2DbWindows,
    lists,
  };
}
const { initListenerEvent, lists, sendSearch2DbWindows } = useKankan();
var timer = null;
watch(props, (new_v, old_v) => {
  if (new_v.vodName) {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      sendSearch2DbWindows(new_v.vodName);
    }, 500);
  }
});
onMounted(() => {
  initListenerEvent();
  sendSearch2DbWindows();
});

onBeforeUnmount(() => {
  ipcRenderer.removeListener("getSpiderBy360Event", () => {});
});
</script>

<style lang="scss" scoped></style>
