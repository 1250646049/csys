<template>
  <div class="read" :style="{ background: readSetting.bgcolor ? readSetting.bgcolor : '#faf0d9' }">
    <!-- 头部信息 -->
    <HeaderCom
      :header-title="bookContent['title'] ? '阅读:' + bookContent['title'] : ''"
      :fex-show-bg="true"
      :show-other="false"
    />
    <div v-if="bookContent" class="content_read">
      <div class="header">{{ bookContent['bookTitle'] }}</div>
      <div
        :style="{
          color: readSetting.fontcolor ? readSetting.fontcolor : '#333',
          fontSize: readSetting.fontsize ? readSetting.fontsize + 'px' : '16px',
          lineHeight: readSetting.fontsize ? readSetting.fontSize + 14 + 'px' : '26px'
        }"
        class="body"
        v-html="bookContent['bookContent']"
      ></div>
    </div>

    <ul class="setting">
      <li @click="onChangeRead(0)">上一章</li>
      <li @click="setVisible = true">设置</li>
      <li @click="onChangeRead(1)">下一章</li>
    </ul>
    <!--    @cancel="onRestSetting" -->
    <div class="utils">
      <a-modal
        v-model:visible="setVisible"
        @cancel="setVisible=false"
        cancel-text="关闭"
        @ok="saveSetting"
     
      >
        <template #title> 阅读设置 </template>
        <div class="setting_container">
          <a-list>
            <a-list-item
              ><span style="margin-right: 10px">背景颜色:</span>
              <span
                ><a-input style="width: 120px" v-model="readSetting.bgcolor" type="color" /> </span
            ></a-list-item>
            <a-list-item
              ><span style="margin-right: 10px">字体颜色:</span
              ><span>
                <a-input style="width: 120px" v-model="readSetting.fontcolor" type="color" /> </span
            ></a-list-item>
            <a-list-item
              ><span style="margin-right: 10px">字体大小:</span
              ><span>
                <a-slider
                  v-model="readSetting.fontsize"
                  :default-value="readSetting.fontsize"
                  :style="{ width: '120px' }"
                /> </span
            ></a-list-item>
            <a-list-item
              ><span style="margin-right: 10px">翻页快捷键(上一页):</span>
              <a-input
                @blur="onUnfocusSetting('prevKey')"
                @focus="onFocusSetting('prevKey')"
                readonly
                v-model="readSetting.prevKey"
                style="width: 120px"
            /></a-list-item>
            <a-list-item
              ><span style="margin-right: 10px">翻页快捷键(下一页):</span>
              <a-input
                @blur="onUnfocusSetting('nextKey')"
                @focus="onFocusSetting('nextKey')"
                readonly
                v-model="readSetting.nextKey"
                style="width: 120px"
            /></a-list-item>
          </a-list>
        </div>
      </a-modal>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, onMounted, onUnmounted, ref, onBeforeUnmount } from 'vue'
const { ipcRenderer } = require('electron')
import HeaderCom from '../components/HeaderCom.vue'
import { useRoute } from 'vue-router'
import useStore from '../store/setting'
import useHistoryStore from '../store/history'
const route = useRoute()
const store = useStore()
const history = useHistoryStore()
defineComponent({
  HeaderCom
})

function useBookRead() {
  const bookContent = ref({})
  // 阅读来源
  const readType = ref(null)
  const curUrl = ref(null)
  // 小说图片
  const bookImg = ref(null)
  // 小说作者
  const author = ref(null)
  // 小说详情页url
  const detailPageUrl = ref(null)
  const setVisible = ref(false)
  const readSetting = computed(() => store.$state.readSetting)
  // 当前选择的按键
  const curSelect = ref('')
  var timer=null;
  // 初始化数据
  const initData = function () {
    const { type, url, bookPic, bookAuthor, detailUrl } = route.query
    readType.value = type
    curUrl.value = url
    bookImg.value = bookPic
    author.value = bookAuthor
    detailPageUrl.value = detailUrl
    // 发送查询请求给到我们的子窗口
    ipcRenderer.invoke('sendStartReadContent', { type, url })
    ipcRenderer.on('startReadBookContent', (event, data) => {
      let result = JSON.parse(data)
      bookContent.value = { ...result }
      window.scrollTo({ top: 0 })
    })
  }
  // 切换阅读
  const onChangeRead = function (type) {
    const { nextUrl, prevUrl } = bookContent.value
    let reqUrl = type == 0 ? prevUrl : nextUrl
    ipcRenderer.invoke('sendStartReadContent', {
      type: readType.value,
      url: reqUrl
    })
    curUrl.value = reqUrl
  }

  // 保存设置
  const saveSetting = function () {
    setVisible.value = false
  }

  const removeListener = function () {
    ipcRenderer.removeListener('startReadBookContent', () => {})
  }
  // 加入阅读历史
  const addReadHistory = function () {
    history.addReadHistory({
      readType: readType.value,
      type: 'history',
      bookPic: bookImg.value,
      curUrl: curUrl.value,
      bookTitle: bookContent.value['title'],
      // 当前阅读的内容
      readTitle: bookContent.value['bookTitle'],
      author: author.value,
      detailPageUrl: detailPageUrl.value
    })
  }
  // 翻页设置|| 获取焦点的时候
  const onFocusSetting = function (type) {
    curSelect.value = type
  }
  // 翻页设置 失去焦点的时候
  const onUnfocusSetting = function () {
    curSelect.value = ''
  }

  // 初始化按键监听
  const initEvent = function () {
    window.addEventListener('keydown', (e) => {
      const { code } = e
      // 判断是否设置选项
      if (setVisible.value && curSelect.value) {
        // 设置内容 需要两个按键保持不一致
        if (curSelect.value == 'prevKey' && readSetting.value.nextKey == code) {
          return
        }
        if (curSelect.value == 'nextKey' && readSetting.value.prevKey == code) {
          return
        }
        readSetting.value[curSelect.value] = code
      } else {
        // 进行常规操作
        timer && clearTimeout(timer)
        timer = setTimeout(() => {
          if (code == readSetting.value.nextKey) {
            onChangeRead(1)
          } else if (code == readSetting.value.prevKey) {
            onChangeRead(0)
          }
        }, 200)
      }
    })
  }

  const onRestSetting = function () {
    readSetting.value.bgcolor = '#faf0d9'
    readSetting.value.fontcolor = '#333'
    readSetting.value.nextKey = 'ArrowRight'
    readSetting.value.prevKey = 'ArrowLeft'
    readSetting.value.fontsize = 14
    setVisible.value = false
  }
  return {
    initData,
    bookContent,
    onChangeRead,
    removeListener,
    setVisible,
    saveSetting,
    onFocusSetting,
    readSetting,
    onUnfocusSetting,
    initEvent,
    onRestSetting,
    addReadHistory
  }
}
const {
  initData,
  bookContent,
  onChangeRead,
  removeListener,
  setVisible,
  saveSetting,
  onFocusSetting,
  readSetting,
  onUnfocusSetting,
  initEvent,
  onRestSetting,
  addReadHistory
} = useBookRead()
onMounted(() => {
  initData()
  initEvent()
})
// 页面即将卸载
onBeforeUnmount(() => {
  removeListener()
  addReadHistory()
})
</script>

<style lang="scss" scoped>
.read {
  width: 100%;
  min-height: 100%;
  .content_read {
    margin-top: 50px;
    box-sizing: border-box;
    padding: 20px 30px;
    .header {
      font-size: 24px;
      color: rgb(50, 50, 50);
      font-weight: 600;
      border-bottom: 1px solid #ccc;
      padding-bottom: 20px;
    }
    .body {
      margin-top: 20px;
    }
  }
  .setting {
    position: fixed;
    right: 1px;
    top: 110px;
    transform: translateY(-50%);
    // background: rgba($color: line, $alpha: 0.8);
    background: linear-gradient(to bottom, #d2e9f2, #d3e5f0, #eeeeee);
    opacity: 0.5;
    font-weight: bold;
    color: orangered;
    box-sizing: border-box;
    padding: 15px;
    border: 1px dashed #2f2f37;
    li {
      margin: 12px 0;

      font-size: 14px;
      font-weight: 500;
      text-align: center;
      // pointer-events: none;
      cursor: pointer;
    }
  }
}
</style>
