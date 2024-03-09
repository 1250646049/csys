<template>
  <div class="book">启动小说爬虫</div>
</template>

<script setup>
import { defineProps, onMounted } from "vue";
import {
  startSpider,
  startSpiderDetail,
  startReadBookContent,
  startSearchContent
} from "../../request/spide/bookSpider/comparRequest";
const { ipcRenderer } = require("electron");
function useBook() {
  const initData = function () {
    try {
      ipcRenderer.on("getBookDataList", async (_, data) => {
        await startSpider(data);
      });

      ipcRenderer.on("BookSpiderDetailEvent", async (_, data) => {
        await startSpiderDetail(data);
      });

      ipcRenderer.on("sendStartReadContent", async (_, data) => {
        await startReadBookContent(data);
      });

      ipcRenderer.on("startSearchContentEvent",async(_,data)=>{
         await startSearchContent(data)
      })
    } catch (e) {}
  };

  return {
    initData,
  };
}
const { initData } = useBook();
onMounted(() => {
  initData();
});
</script>

<style lang="scss" scoped></style>
