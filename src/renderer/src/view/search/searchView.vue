<template>
  <div class="search">
    <!-- 头部内容区域 -->
    <HeaderCom
      :header-title="searchContent ? '正在为你检索:' + searchContent : ''"
      :show-other="false"
      :fex-show-bg="true"
    />
    <div class="search_content">
      <div class="left">
        <SearchLeftComVue />
      </div>
      <div class="right">
        <YunpanSearch />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineComponent, onMounted, defineProps, onActivated } from 'vue'
import HeaderCom from '../../components/HeaderCom.vue'
import SearchLeftComVue from '../../components/SearchLeftCom.vue'
import YunpanSearch from '../../components/YunpanSearchCom.vue'
const { ipcRenderer } = require('electron')
const props = defineProps(['suspensionRef'])
defineComponent({
  HeaderCom,
  SearchLeftComVue,
  YunpanSearch
})

function useSearch() {
  //   初始化事件
  const initMitt = async function () {
    await ipcRenderer.invoke('searchWindowEvent', {
      show: true,
      url: 'searchSpider'
    })
  }

  return {
    initMitt
  }
}

const { initMitt } = useSearch()
onMounted(() => {
  initMitt()

})
onActivated(() => {
  if (props.suspensionRef) {
    props.suspensionRef.onRestShowTable(false)
  }
})
</script>

<style lang="scss" scoped>
.search {
  width: 100%;
  height: 100vh;
  overflow: hidden;

  .search_content {
    margin-top: 50px;
    width: 100%;
    display: flex;
    height: 100%;
    .left {
      flex: 18%;
      height: 100%;
    }
    .right {
      flex: 82%;
      height: 100%;
      background: #eef0f7;
    }
  }
}
</style>
