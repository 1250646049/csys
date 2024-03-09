<template>
  <div class="">你好我可以帮你搜索内容的</div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
const { ipcRenderer } = require('electron')
import { startSearch } from '../../request/spide/searchSpider/comparSearch'
function useSearchSpider() {
  const initMitt = function () {
    ipcRenderer.on('searchYunpanSearchListenerEvent', async (event, args) => {
      await startSearch(typeof args=="string"?JSON.parse(args):args)
    })
  }
  const removeMitt = function () {
    ipcRenderer.removeListener('searchYunpanSearchListenerEvent', () => {})
  }
  return {
    initMitt,
    removeMitt
  }
}
const { initMitt, removeMitt } = useSearchSpider()

onMounted(() => {
  initMitt()
})
onUnmounted(() => {
  removeMitt()
})
</script>

<style lang="scss" scoped></style>
