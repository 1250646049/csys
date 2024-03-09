<template>
  <div class="header">
    <div
      class="top"
      :style="{
        background: isShowBg ? 'rgb(47,47,55)' : fexShowBg ? 'rgb(47,47,55)' : ''
      }"
    >
      <!-- 首页显示标题 -->
      <div
        :style="!showOther && headerTitle ? 'margin-left:60px;margin-top:1px' : ''"
        class="left_title"
        v-if="(isShowBg && showOther && reqMax) || headerTitle"
      >
        {{ headerTitle ? headerTitle : '畅视免费影视' }}
      </div>
      <!-- 显示首页|返回 -->
      <div class="left_title" v-if="!showOther && reqMax">
        <span @click="onClickTab(0)" class="iconfont icon-shouyefill"></span>
        <span @click="onClickTab(1)" class="iconfont icon-fanhui"></span>
      </div>
      <div v-if="showOther" class="search">
        <a-popover trigger="click" content-style="background: #444349">
          <span class="iconfont icon-sousuo"></span>

          <template #content>
            <IndexSearch />
          </template>
        </a-popover>
      </div>
      <div @click="onMenuClick('history')" v-if="showOther" class="history">
        <a-popover content-style="background: #444349">
          <span class="iconfont icon-lishixiao"></span>

          <template #content>
            <History />
          </template>
        </a-popover>
      </div>
      <div v-if="showOther" class="more">
        <a-dropdown @select="handleSelect">
          <span class="iconfont icon-androidgengduo"></span>
          <template #content>
            <a-doption @click="onMenuClick('setting')">系统设置</a-doption>
            <a-doption @click="onMenuClick('db', true)">
              <icon-check style="color: red" v-if="setting.mode == 'db'" />
              本地数据源</a-doption
            >
            <a-doption @click="onMenuClick('req', true)">
              <icon-check v-if="setting.mode == 'req'" style="color: red" />远程数据源</a-doption
            >
          </template>
        </a-dropdown>
      </div>
      <!-- 最大最小关闭按钮组 -->
      <div class="opera">
        <span @click="onWindowOpera(0)" class="iconfont icon-zuixiaohua"></span>
        <span v-if="reqMax" @click="onWindowOpera(1)" class="iconfont icon-zuidahua"></span>
        <span @click="onWindowOpera(2)" class="iconfont icon-guanbi"></span>
      </div>
    </div>
    <SwiperCom v-if="showOther" />
    <div class="left"></div>
  </div>
</template>

<script setup>
import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  defineProps,
  defineEmits,
  computed,
  defineAsyncComponent,
  nextTick
} from 'vue'
import { IconCheck } from '@arco-design/web-vue/es/icon'
import { useRouter, useRoute } from 'vue-router'
import SwiperCom from './SwiperCom.vue'
import { sendMinxMaxCloseType } from '../utils/sendMessage'
import useStore from '../store/setting'

import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

const store = useStore()
const route = useRoute()
defineComponent({
  SwiperCom
})
defineProps({
  showOther: {
    type: Boolean,
    default: true
  },
  reqMax: {
    type: Boolean,
    default: true
  },
  headerTitle: {
    type: String,
    default: ''
  },
  fexShowBg: {
    type: Boolean,
    default: false
  }
})

const History = defineAsyncComponent(() => import('../components/HistoryList.vue'))
const IndexSearch = defineAsyncComponent(() => import('../components/IndexSearch.vue'))
const emit = defineEmits(['onMenuClick'])
const router = useRouter()
function useHeader() {
  const setting = computed(() => store.$state)
  const isShowBg = ref(false)
  const onWindowOpera = function (type) {
    sendMinxMaxCloseType(type)
  }
  // 返回首页| 返回上一层
  const onClickTab = function (type) {
    if (type == 0) {
      router.push({
        name: 'main'
      })
    } else if (type == 1) {
      // 需要判断|因为播放页切换集数播放使用路由重加载
      const {
        query: { vodId },
        name
      } = route
      let pathName = ''
      switch (name) {
        case 'play': {
          pathName = 'detail'
          break
        }
        default: {
          pathName = 'main'
        }
      }
      // 直接返回详情页
      if (name == 'bookRead') {
        router.back()
        return
      }
      router.push({
        name: pathName,
        query: {
          vodId
        }
      })
      // router.go(-1);
    }
  }
  // 滚动条滚动事件

  const emitScrollBar = function () {
    document.addEventListener('scroll', (_) => {
      if (window.scrollY >= 10) {
        isShowBg.value = true
      } else {
        isShowBg.value = false
      }
    })
  }

  // 解绑滚动条事件
  const unEmitScrollBar = function () {
    document.removeEventListener('scroll', () => {})
  }

  // 按钮点击派发事件 type|类型  datasources数据源 如果是数据源点击事件 则进行触发

  const onMenuClick = function (type, datasource) {
    if (datasource && setting.value.mode != type) {
      store.$state.mode = type
    }
    emit('onMenuClick', type)
  }

  // 初始化首页欢迎屏
  const initDrive = function () {
    // const cstDriver = driver({
    //   showProgress: true,
    //   doneBtnText:"已知晓",
    //   nextBtnText:"下一步",
    //   prevBtnText:"上一步",
    //   steps: [
    //     { element: '.icon-sousuo', popover: { title: 'Ttitle', description: 'Description' } },
    //     { element: '.history', popover: { title: 'Ttitle', description: 'Description' } }
    //   ]
    // })
    // cstDriver.drive()
  }
  return {
    onWindowOpera,
    emitScrollBar,
    unEmitScrollBar,
    isShowBg,
    onClickTab,
    onMenuClick,
    setting,
    initDrive
  }
}

const {
  onWindowOpera,
  emitScrollBar,
  unEmitScrollBar,
  isShowBg,
  onClickTab,
  onMenuClick,
  setting,
  initDrive
} = useHeader()

onMounted(() => {
  initDrive()
  emitScrollBar()
})

onUnmounted(() => {
  unEmitScrollBar()
})
</script>

<style lang="scss">
.header {
  position: relative;
  // height: 45px;
  .top {
    position: fixed;

    top: 0;
    left: 0;
    right: 0;
    z-index: 999;
    padding: 10px;
    transition: all 0.3s;
    justify-content: end;

    display: flex;
    .left_title {
      position: absolute;
      left: 10px;
      color: white;
      font-size: 18px;
      transition: all 0.3s;
      font-weight: 600;
      cursor: pointer;
      span {
        margin-right: 10px;
      }
    }
    .opera {
      background: rgba(48, 58, 66, 0.6);
      box-sizing: border-box;
      border-radius: 20px;
      padding: 4px;
      span {
        font-size: 16px !important;
        margin-right: 8px;
        margin-left: 8px;
      }
    }
    & > div {
      margin-right: 30px;
      .iconfont {
        color: white;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
      }
    }
  }
}
</style>
