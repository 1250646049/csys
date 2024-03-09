<template>
  <div class="book">
    <!-- 主色调 -->
    <HeaderCom header-title="小说阅读" :show-other="false" :fex-show-bg="true" />
    <div class="content_book">
      <!-- 搜索 -->
      <div class="searchContainer">
        <!-- 分页 -->
        <div class="paginter" v-if="!searchContent">
          <a-pagination
            :current="searchData.pg"
            simple
            @change="onPageChange"
            :total="100"
            show-jumper
          />
        </div>
        <!-- 搜索内容区域 -->
        <div class="search">
          <a-input-search
            @clear="onSearchRead"
            @input="onSearchRead"
            v-model="searchContent"
            allow-clear
            placeholder="书名/作者/关键词/简介"
          />
        </div>
        <!-- 右边工具栏目 -->
        <div class="utils">
          <!-- 阅读记录 -->
          <span @click="onShowReadList('history')">
            <img src="../assets/icon/record.png" alt=""
          /></span>
          <!-- 书架 -->
          <span @click="onShowReadList('record')"><img src="../assets/icon/sj.png" alt="" /></span>

          <a-drawer
            :footer="false"
            :mask-closable="true"
            :width="340"
            :visible="listsVisible"
            @cancel="() => (listsVisible = false)"
          >
            <template #title>
              {{ listShowType == 'history' ? '我的阅读历史' : '我的书架' }}
            </template>
            <div>
              <ReadListComVue />
            </div>
          </a-drawer>
        </div>
      </div>
      <div class="bottom">
        <div class="left">
          <BookLeft @onCategoryClick="onCategoryClick" />
        </div>
        <div class="right">
          <div
            v-if="lists.length"
            :style="
              searchContent
                ? 'grid-template-columns: repeat(2, 1fr);'
                : '  grid-template-columns: repeat(2, 1fr);'
            "
            class="right_container"
          >
            <div v-for="(item, index) in lists" :key="index">
              <BookItem :item="item" />
            </div>
          </div>
          <a-empty v-else />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineComponent, onBeforeUnmount, onMounted, ref, provide } from 'vue'
const { ipcRenderer } = require('electron')
import HeaderCom from '../components/HeaderCom.vue'
import BookLeft from '../components/BookLeft.vue'
import BookItem from '../components/BookItem.vue'
import ReadListComVue from '../components/ReadListCom.vue'
defineComponent({
  HeaderCom,
  BookLeft,
  BookItem,
  ReadListComVue
})
function useBookView() {
  const searchContent = ref('')
  const lists = ref([])
  const searchData = ref({ pg: 1, type: '', cate: '', srouce: '' })
  const listsVisible = ref(false)
  // 是否显示书架|历史数据
  const listShowType = ref('history')
  var timer = null
  const pastLists = ref([])
  // 筛选显示 左边赛选显示
  const searchShow = ref({
    cate: true,
    source: false
  })
  const initData = async () => {
    // 显示窗口
    await window.createBookWindow({
      show: false,
      url: 'bookSpider'
    })

    // 因为小说窗口要跳转才能正常监听事件
    window.setTimeout(() => {
      initMitt()
    }, 1500)
  }
  // 初始化监听
  const initMitt = function () {
    // 开始发送消息获取book列表
    let readSearchData = window.sessionStorage.getItem('readSearchData')
    if (!readSearchData) {
      ipcRenderer.invoke('getBookDataList', { pg: searchData.value.pg })
    } else {
      const { search, data, y } = JSON.parse(readSearchData)
      lists.value = [...data]
      searchShow.value.cate = false
      searchShow.value.source = true
      searchContent.value = search
      window.scrollTo({ top: y })
    }

    // 接受爬虫返回值
    ipcRenderer.on('BookSpiderDataListener', async (event, data) => {
      if (lists.value.length) return
      lists.value = JSON.parse(data)
      pastLists.value = JSON.parse(data)
    })
    // 监听搜索返回的内容
    ipcRenderer.on('startSearchContentListener', async (event, data) => {
      if (data) {
        lists.value = JSON.parse(data)
      }
    })
  }
  // 分页改变时候
  const onPageChange = function (index, isCateChange = false) {
    if (!isCateChange) {
      if (searchData.value.pg == index) return
      searchData.value.pg = index
    }
    lists.value = []
    ipcRenderer.invoke('getBookDataList', JSON.stringify(searchData.value))
  }

  // 移除监听
  const removeMitt = function () {}
  // 自定义搜索反馈事件
  const onCategoryClick = function (result) {
    const { type, value } = result
    // 分类搜索
    if (type == 'cate') {
      searchData.value.cate = type
      searchData.value.type = value
      onPageChange(1, true)
    } else if (type == 'source') {
      // 切换小说源
      lists.value = []
      searchData.value.srouce = value
      ipcRenderer.invoke('startSearchContentEvent', { content: searchContent.value, type: value })
    }
  }
  // 显示阅读数据
  const onShowReadList = function (showType) {
    // 提供给子组件需要显示的类型
    provide('showType', showType)
    listShowType.value = showType
    listsVisible.value = true
  }
  // 搜索小说内容
  const onSearchRead = function () {
    lists.value = []
    if (!searchContent.value) {
      window.sessionStorage.removeItem('readSearchData')

      ipcRenderer.invoke('getBookDataList', { pg: searchData.value.pg })
      searchShow.value.cate = true
      searchShow.value.source = false
      return
    }

    timer && clearTimeout(timer)
    searchShow.value.cate = false
    searchShow.value.source = true
    timer = setTimeout(() => {
      ipcRenderer.invoke('startSearchContentEvent', {
        content: searchContent.value,
        type: searchData.value.srouce
      })
    }, 300)
  }
  // 记录搜索list
  const recordSearchlist = function () {
    if (searchContent.value) {
      let readSearchData = {
        search: searchContent.value,
        data: lists.value,
        y: window.scrollY
      }
      window.sessionStorage.setItem('readSearchData', JSON.stringify(readSearchData))
    }
  }
  return {
    searchContent,
    initData,
    lists,
    onPageChange,
    searchData,
    onCategoryClick,
    removeMitt,
    listsVisible,
    listShowType,
    onShowReadList,
    onSearchRead,
    recordSearchlist,
    searchShow
  }
}

const {
  searchContent,
  initData,
  lists,
  onPageChange,
  searchData,
  onCategoryClick,
  removeMitt,
  listsVisible,
  listShowType,
  onShowReadList,
  onSearchRead,
  recordSearchlist,
  searchShow
} = useBookView()
// 提供给子组件当前要展示的数据
provide('showType', listShowType)
provide('searchShow', searchShow)
onMounted(() => {
  initData()
})

onBeforeUnmount(() => {
  // 避免重复搜索 故要记录数据
  recordSearchlist()
  removeMitt()
})
</script>

<style lang="scss">
.book {
  background: #2f2f37;
  // height: 100vh;
  width: 100%;
  min-height: 100%;
  .content_book {
    .bottom {
      display: flex;
      margin-top: 110px;
      .left {
        width: 30%;
        // padding: 20px;
        margin-right: 10px;
        margin-left: 10px;
      }
      .right {
        width: 67%;
        .right_container {
          display: grid;

          grid-template-rows: repeat(2, 150px);
          row-gap: 15px;
        }
      }
    }
    .searchContainer {
      // padding-bottom: 100px;
      height: 60px;
      display: flex;
      position: fixed;
      top: 50px;
      left: 0;
      right: 0;
      background: #2f2f37;
      box-sizing: border-box;
      padding: 10px;
      justify-content: center;
      .search {
        width: 340px;
        margin: 0 auto;
      }
      .utils {
        margin-right: 60px;
        span {
          cursor: pointer;
          margin-right: 30px;
          img {
            width: 40px;
            height: 40px;
          }
        }
      }
    }
  }
  .arco-pagination-jumper > span {
    color: #165dff !important;
  }
}
</style>
