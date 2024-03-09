<template>
  <div class="main">
    <!-- 影视屏频道 -->
    <LeftMenu>
      <template #content>
        <keep-alive>
          <component
            :suspensionRef="suspensionRef"
            :is="compontList[compontIndex]"
          ></component>
        </keep-alive>
      </template>
    </LeftMenu>
    <SuspensionCom ref="suspensionRef" @supensionChange="supensionChange" />
  </div>
</template>

<script setup>
import { defineComponent, onMounted, ref } from 'vue'
import IndexView from './indexView.vue'
import BookView from './bookView.vue'
import SuspensionCom from '../components/SuspensionCom.vue'
import useStore from '../store/setting'
import LeftMenu from '../components/LeftMenu.vue'
import SearchView from './search/searchView.vue'
const settingStore = useStore()
defineComponent({
  SuspensionCom,
  LeftMenu
})
function useMainView() {
  const compontIndex = ref(settingStore.$state.mainComponentIndex)
  const suspensionRef = ref(null)
  const compontList = [IndexView, BookView, SearchView]
  const initData = function () {}
  const supensionChange = function (index) {
    if (index == compontIndex.value) return
    compontIndex.value = index
    // 更新本地缓存
    settingStore.$state.mainComponentIndex = index
  }
  return {
    initData,
    compontIndex,
    supensionChange,
    compontList,
    suspensionRef
  }
}
const { initData, compontIndex, supensionChange, compontList, suspensionRef } = useMainView()
onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>
.main {
  height: 100%;
}
</style>
