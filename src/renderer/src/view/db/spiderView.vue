<template>
  <div class="spider">
    <a-list size="small">
      <!-- <template #header> List title </template> -->
      <a-list-item v-for="(item, index) in lists" :key="index" style="color: white">{{
        "正在采集:" + item["vod_name"] + "(" + item["vod_remarks"] + ")"
      }}</a-list-item>
    </a-list>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, onBeforeUnmount } from "vue";
import { startReqData2Db } from "../../request/spide/startTask";
import { startSearchData } from "../../request/spide/360kanSpide";
const { ipcRenderer } = require("electron");
function useSpider() {
  const lists = reactive([]);
  const object = ref({});
  const startSpider = function () {
    try {
      startReqData2Db();
      ipcRenderer.on("spiderEvent", (_, result) => {
        lists.splice(0, lists.length);
        lists.push(...result["list"]);
        result["list"] = [];
        object.value = { ...result };
      });
      // 获取360爬虫消息
      ipcRenderer.on("sendChildSpiderBy360Event", (_, result) => {
        startSearchData(result);
      });
      // 根据名称入库数据
      ipcRenderer.on("onSyncByName", (_, vodName) => {
        startReqData2Db(vodName);
      });
    } catch (e) {
      console.log(e);
    }
  };
  return {
    startSpider,
    lists,
    object,
  };
}
const { startSpider, lists, object } = useSpider();
onMounted(() => {
  startSpider();
});

onBeforeUnmount(() => {
  ipcRenderer.removeListener("onSyncByName", () => {});
  ipcRenderer.removeListener("sendChildSpiderBy360Event", () => {});
  ipcRenderer.removeListener("spiderEvent", () => {});
});
</script>

<style lang="scss" scoped></style>
