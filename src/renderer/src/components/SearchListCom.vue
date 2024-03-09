<template>
  <div class="list" ref="listsEl" @mousedown.stop="">
    <div class="item" v-for="(item, index) in resultList" :key="index">
      <div class="avater">
        <a-avatar :size="30" :style="{ backgroundColor: '#2F2F37' }"> AI </a-avatar>
      </div>
      <div class="lists">
        <div class="items">
          <a-spin v-if="item['isLoading']" :size="32" />
          <div class="box">
            <div class="titls" v-if="item['title'] && !item['isLoading']">
              <div v-if="item['type'] == 'yunpan'" class="title">
                {{ '云盘: ' + item['title'] }}
              </div>

              <span></span>
            </div>

            <div v-if="!item['isLoading']" class="value">
              <!-- 云盘资源采集 -->
              <YunpanType
                :curIndex="item['curIndex']"
                :title="item['title']"
                @changePageIndex="changePageIndex"
                v-if="item['type'] == 'yunpan'"
                :index="index"
                :list="item['lists']"
              />
              <!-- 影视资源采集 -->
              <MoviceType
                ref="moviceTypeRefs"
                :title="item['title']"
                @moviceStartPlay="moviceStartPlay"
                :searchId="item['searchId']"
                :playObject="item['playObject']"
                @sendFatherSearchLins="sendFatherSearchLins"
                :params="item['params']"
                :list="item['lists']"
                v-if="item['type'] == 'movice'"
              ></MoviceType>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fixed_item" v-if="selectObject && selectIndex != -1">
      <span @click="onChangeSelectIndex(null, 'up')" style="font-size: 20px"
        ><icon-double-up
      /></span>
      <span
        @click="onChangeSelectIndex(items)"
        v-for="items in Object.keys(selectObject)"
        :key="items"
        :class="selectIndex == items ? 'active' : ''"
        >{{ selectObject[items]['label'] }}</span
      >
      <span @click="onChangeSelectIndex(null, 'dowm')" style="font-size: 20px"
        ><icon-double-down
      /></span>
    </div>
  </div>
</template>

<script setup>
import {
  onMounted,
  ref,
  getCurrentInstance,
  onUnmounted,
  defineEmits,
  defineComponent,
  computed,
  nextTick
} from 'vue'
import YunpanType from './searchType/yunpanType.vue'
import MoviceType from './searchType/moviceType.vue'
import { IconDoubleUp, IconDoubleDown } from '@arco-design/web-vue/es/icon'
import useSearchStore from '../store/search'
import { Notification } from '@arco-design/web-vue'
const searchStore = useSearchStore()
const { $mitt } = getCurrentInstance().appContext.config.globalProperties
defineComponent({
  YunpanType,
  MoviceType
})
const { ipcRenderer } = require('electron')
const emits = defineEmits(['strtSearchResult'])
function useSearchlist() {
  // 列表元素组件
  const listsEl = ref(null)
  // 列表元素滚动节流参数
  var scrollTimer = null
  const moviceTypeRefs = ref([])
  const searchType = ref([])
  const seelctTypeIndex = ref(0)
  // 搜索的内容
  const results = ref(searchStore.$state.yunpan.results)
  const resultList = computed(() => {
    if (!results.value || results.value.length == 0) return []
    let lists = [...results.value]
    lists.sort((n1, n2) => n1['searchId'] - n2['searchId'])
    return lists
  })
  // 当前操作数据的索引位
  const curListIndex = ref(null)
  const searchObject = ref({
    content: '',
    page: 1
  })
  // 影视剧搜索参数
  const moviceSearchObject = ref({
    playType: 'header',
    searchId: -1,
    itemIndex: -1
  })

  // 记录当前位置索引
  const selectIndex = ref(searchStore.$state.yunpan.selectIndex)
  const selectObject = ref(searchStore.$state.yunpan.selectObject)
  const searchContent = ref('')
  const searchPlugs = computed(() => searchStore.$state.plugins)
  // 执行搜索逻辑|搜索内容改变后 会执行方法
  // 搜索索引| 分页|标题
  const initData = function (
    dataIndex = null,
    pageIndex = 1,
    title = null,
    selectTypeIndex = seelctTypeIndex.value
  ) {
    if (!searchType.value || searchType.value.length == 0) {
      Notification.error('请先选择搜索插件~')
      retSearchResult()
      return
    }

    // 初始基础设置
    initSetting()

    if (dataIndex == null) {
      results.value.push({
        startDate: new Date(),
        isLoading: true,
        title: searchContent.value
      })
    }
    curListIndex.value = dataIndex
    searchObject.value.page = pageIndex
    searchObject.value.content = title ? title : searchContent.value

    ipcRenderer.invoke(
      'searchYunpanSearchEvent',
      JSON.stringify({ ...searchObject.value, type: searchType.value[selectTypeIndex] })
    )
  }

  // 初始化基础设置
  const initSetting = function () {}
  // 初始化主窗口的监听
  const initMitt = function () {
    initChildMovicePlay()
    scrollTimer && clearTimeout(scrollTimer)
    listsEl.value.addEventListener('scroll', () => {
      scrollTimer = setTimeout(() => {
        initChildMovicePlay()
      }, 100)
    })

    // 监听开始去搜索事件
    $mitt.on('onSearchValueRet', (v) => {
      searchContent.value = v
      let types = searchPlugs.value.filter((item) => item['select']).map((item) => item['type'])
      if (types) {
        searchType.value = [...types]
        initData()
      }
    })
    // 监听搜索内容返回
    ipcRenderer.addListener('startSearchContentEventListener', (event, args) => {
      if (args) {
        let data = []
        let type = ''
        // 其他类别需要存储的对象
        let params = {}
        let r = JSON.parse(args)
        type = r['type']
        try {
          if (type == 'yunpan') {
            data = r['result']['items']
          } else if (type == 'movice') {
            data = r['list']
            r['list'] = []
            params = { ...r }
          } else if (type == 'moviceLines') {
            // 在这里要发给子组件播放消息
            const { searchId, itemIndex } = moviceSearchObject.value
            // results.value[bigIndex][itemIndex]={}
            let datas = results.value.find((item) => item['searchId'] == searchId)
            if (datas['lists']) {
              datas['lists'][itemIndex]['childs'] = r['list']
            }
            return
          }
        } catch (e) {
        } finally {
          // 如果是影片搜索播放列表 则不进行数据存储只通信父组件
          if (type == 'moviceLines') {
            return
          }
          let item = {}
          if (curListIndex.value == null) {
            item = results.value[results.value.length - 1]
          } else {
            item = results.value[curListIndex.value]
          }
          item['params'] = { ...params }
          item['isLoading'] = false
          item['lists'] = data
          item['endDate'] = new Date()
          item['type'] = type
          item['searchId'] = new Date().getTime()
          item['curIndex'] = searchObject.value.page
          // 延迟一秒中 派发父组件时间 并且 滚动到底部
          setTimeout(() => {
            retSearchResult()
          }, 1000)
        }
      }
    })
  }
  // 返回搜索结果
  const retSearchResult = function () {
    $mitt.emit('retSearchResult', true)
    if (!searchType.value) return

    if (curListIndex.value == null) {
      // 当前位置自—+1
      let curIndex = Number(selectIndex.value) + 1
      selectIndex.value = curIndex
      searchStore.$state.yunpan.selectIndex = curIndex
      // 并且记录当前的滚动条的位置
      selectObject.value[curIndex] = {
        label: searchContent.value,
        y: listsEl.value.scrollHeight
      }
      initElPosition()
    }
    // 判断是否为组合搜索
    try {
      if (seelctTypeIndex.value < searchType.value.length - 1) {
        seelctTypeIndex.value = seelctTypeIndex.value + 1
        initData()
      }
    } catch (e) {}
  }
  const initElPosition = function () {
    listsEl.value.scrollTop = listsEl.value.scrollHeight
  }
  // 移除监听
  const removeMitt = function () {
    listsEl.value.removeEventListener('scroll', () => {})
    ipcRenderer.removeListener('startYunpanSearchListener', () => {})
  }
  // 分页 云盘
  const changePageIndex = function ({ index, pageIndex, title }) {
    searchType.value = ['yunpan']
    seelctTypeIndex.value = 0
    initData(index, pageIndex, title)
  }
  // 改变当前索引位置
  const onChangeSelectIndex = function (index, type) {
    if (index == null && type) {
      if (type == 'up') {
        listsEl.value.scrollTop = 0
      } else {
        initElPosition()
      }

      return
    }
    if (selectIndex.value == index) return
    var { y } = selectObject.value[index == 0 ? 0 : index - 1]
    y = index == 0 ? 0 : y - 40
    listsEl.value.scrollTop = y
    selectIndex.value = index
    searchStore.$state.yunpan.selectIndex = index
  }

  // 类型为影视的话 接受子组件查询播放地址的需求
  const sendFatherSearchLins = function (item) {
    const { moviceListId, searchId, itemIndex } = item
    moviceSearchObject.value.searchId = searchId
    moviceSearchObject.value.itemIndex = itemIndex

    ipcRenderer.invoke(
      'searchYunpanSearchEvent',
      JSON.stringify({ playType: 'line', moviceListId })
    )
  }

  // 初始化子组件加载视频播放
  const initChildMovicePlay = function () {
    if (!moviceTypeRefs.value || moviceTypeRefs.value.length == 0) return
    moviceTypeRefs.value.forEach((item) => {
      item.initViewListenr(item.serchId)
    })
  }
  // 视频组件 开始播放的时候
  const moviceStartPlay = function ({
    searchId,
    playSource,
    playSourceIndex,
    moviceIndex,
    playIndex
  }) {
    const curItem = results.value.find((item) => item['searchId'] == searchId)
    if (!curItem) return
    let playObject = {
      playSource,
      playSourceIndex,
      moviceIndex,
      playIndex
    }
    curItem['playObject'] = playObject
  }
  return {
    selectIndex,
    initMitt,
    removeMitt,
    results,
    listsEl,
    changePageIndex,
    selectObject,
    onChangeSelectIndex,
    searchContent,
    sendFatherSearchLins,
    moviceStartPlay,
    moviceTypeRefs,
    resultList
  }
}
const {
  initMitt,
  removeMitt,
  results,
  listsEl,
  changePageIndex,
  selectIndex,
  selectObject,
  onChangeSelectIndex,
  sendFatherSearchLins,
  moviceStartPlay,
  moviceTypeRefs,
  resultList
} = useSearchlist()

onMounted(() => {
  initMitt()
})
onUnmounted(() => {
  removeMitt()
})
</script>

<style lang="scss" scoped>
.list {
  box-sizing: border-box;
  padding: 20px;
  height: 80vh;
  overflow-y: scroll;
  overflow-x: hidden;
  transition: all 0.3s;
  // margin-bottom: 20px;
  .item {
    display: flex;
    margin-bottom: 40px;
    margin-top: 20px;
    // width: 100%;
    .lists {
      width: 66vw;
      margin-left: 15px;
      box-sizing: border-box;
      padding: 20px;
      background: white;
      box-shadow: 1px 2px 2px 1px #ccc;
      border-radius: 10px;

      .items {
        .box {
          position: relative;
          .title {
            position: absolute;
            top: -40px;
            background: #2f2f37;
            box-sizing: border-box;
            padding: 4px 15px;
            left: -20px;
            color: white;
            right: -20px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-weight: 600;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
          }

          .value {
            // word-break: break-all;
            word-break: normal;
          }
        }
      }
    }
  }
  .fixed_item {
    position: fixed;
    right: 4px;
    top: 70%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 8px;
    z-index: 999;

    span {
      cursor: pointer;

      font-weight: 600;
      padding: 4px 4px;
      font-size: 12px;
      margin: 2px 0;
      width: 40px;
      text-align: center;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
      &:hover {
        background: orangered;
        color: white;
      }
      &.active {
        background: orangered;
        color: white;
      }
    }
  }
}
</style>
