<template>
  <div class="titles">
    <div class="left">
      {{'影视: '+ title + ' (共' + params['total'] + '部影片)' }}
    </div>
    <div class="right">
      <div class="history" @click="initHistorys" v-if="playObject && !isPlayIng">
        您上次观看到:
        <span style="font-weight: 700; margin: 0px 5px"
          >《{{ list[playObject['moviceIndex']]['vodName'] }}》 </span
        >是否继续观看?
      </div>
      <div class="utils" v-if="isPlayIng">
        <a-dropdown trigger="hover">
          <a-link status="danger"  @click.prevent="">播放源</a-link>
          <template #content>
            <a-doption
              @click="onAlertPlaySouce(item)"
              :style="item == playSource ? 'color:red' : ''"
              :key="item"
              v-for="item in Object.keys(playLists)"
            >
              {{ item }}
            </a-doption>
          </template>
        </a-dropdown>
        <a-link status="danger" @click.prevent="onExitPlay()">退出播放</a-link>
        <!-- <span @click="onExitPlay()">退出播放</span> -->
      </div>
    </div>
  </div>
  <div class="moviceType" ref="moviceRef" v-if="list.length">
    <div v-if="!isPlayIng" class="items">
      <!-- 只显示一行 -->
      <div
        @click="onPlayVideo(item, index)"
        class="item"
        v-for="(item, index) in list"
        :key="index"
      >
        <!-- 头部图片 -->
        <div class="img">
          <div class="tag">
            <span>{{ item['vodRemarks'] }}</span>
          </div>
          <img :src="item['movicePic']" alt="" />
          <div class="task">
            <span class="iconfont icon-bofang"></span>
          </div>
        </div>
        <div class="detail">
          <div class="title">{{ item['vodName'] }}</div>
          <div class="typeName">{{ item['typeName'] }}</div>
        </div>
      </div>
    </div>

    <!-- 播放器组件 -->
    <div v-else class="video">
      <div class="container">
        <VideoCom :index="searchId" :play-item="playItem" />
      </div>
      <div class="list" v-if="playLists">
        <span
          @click="onAlertPlayUrl(index, item)"
          :class="item['active'] ? 'active' : ''"
          v-for="(item, index) in playLists[playSource]"
          :key="index"
          >{{ item['txt'] }}</span
        >
      </div>
    </div>
  </div>

  <a-empty v-else />
</template>

<script setup>
import {
  defineProps,
  defineComponent,
  ref,
  onMounted,
  defineEmits,
  watch,
  computed,
  defineExpose
} from 'vue'
import VideoCom from '../VideoCom.vue'
defineComponent({
  VideoCom
})
const emits = defineEmits(['sendFatherSearchLins', 'moviceStartPlay'])
const props = defineProps({
  params: {
    type: Object,
    default: {}
  },
  list: {
    type: Array,
    default: []
  },
  searchId: {
    type: Number,
    default: 0
  },
  // 存储播放记录
  playObject: {
    type: Object,
    default: null
  },
  // 搜索内容
  title: {
    type: String,
    default: ''
  }
})

function useMoviceType() {
  const moviceRef = ref(null)
  // 是否正在播放
  const isPlayIng = ref(false)
  // 当前播放的影片
  const tapIndex = ref(-1)
  // 当前播放影片的列表数据
  const childs = ref([])
  const playSource = ref('')
  // 当前播放源选择index
  const playSourceIndex = ref(0)
  // 当前播放的数据
  const playItem = ref({})
  // 计算播放集数
  const palyItemjs = ref(0)
  const exitPlay = ref(false)
  // 计算播放列表
  const playLists = computed(() => {
    // 默认重缓存读取数据
    console.log(childs.value);
    if (childs.value && childs.value.length > 0) {
      let playChilds = childs.value.reduce((reduce, item, index) => {
        const { vodPlayUrl = '', vodPlayFrom = '',playType='M3U8' } = item
        let splitPlayUrl = vodPlayUrl.split('#')
        let urls = splitPlayUrl.filter(item=>item).reduce((reduces, items, indexss) => {
          let arr = items.split('$')
          reduces.push({
            txt: arr[0],
            url: arr[1],
            searchId: props.searchId,
            active: indexss == palyItemjs.value ? true : false,
            playType
          })
          return reduces
        }, [])
        reduce[vodPlayFrom] = urls
        return reduce
      }, {})

      playSource.value = playChilds ? Object.keys(playChilds)[playSourceIndex.value] : ''
      playItem.value = playChilds[playSource.value]
      return playChilds
    }
    return []
  })
  // 准备播放与父组件通信
  const onPlayVideo = function (item, index) {
    const { moviceListId } = item
    tapIndex.value = index
    emits('sendFatherSearchLins', {
      moviceListId,
      playType: 'lines',
      searchId: props.searchId,
      itemIndex: index
    })
  }
  // 开始准备行进行播放
  const startPlay = function () {
    try {
      const childLists = props.list[tapIndex.value]['childs']
      if (!childs && props.playObject) {
        playItem.value = props.playObject[playSource.value]
        return
      }
      childs.value = [...childLists]
      // 发送消息给播放组件
      if (playLists.value) {
        // 组件开始播放通信父组件事件
        emits('moviceStartPlay', {
          searchId: props.searchId,
          playSource: playSource.value,
          playSourceIndex: playSourceIndex.value,
          // 影片索引
          moviceIndex: tapIndex.value,
          // 播放集数
          playIndex: palyItemjs.value
        })
        isPlayIng.value = true
      }
    } catch (e) {
    } finally {
    }
  }

  // 切换播放源
  const onAlertPlayUrl = function (index, item) {
    if (palyItemjs.value == index) return
    palyItemjs.value = index
    // 存储当前播放状态
    emits('moviceStartPlay', {
      searchId: props.searchId,
      playSource: playSource.value,
      playSourceIndex: playSourceIndex.value,
      // 影片索引
      moviceIndex: tapIndex.value,
      // 播放集数
      playIndex: palyItemjs.value
    })
    item['active'] = true
  }
  // 初始化历史播放数据
  const initHistorys = function () {
    const playObject = props.playObject
    // 默认从播放记录取数 如果存在的话
    if (!playObject) return

    const { moviceIndex, playIndex } = playObject
    // 1.找到正在播放的影片
    tapIndex.value = moviceIndex
    palyItemjs.value = playIndex
    playSource.value = playObject['playSource']
    playSourceIndex.value = playObject['playSourceIndex']
    const lists = props.list
    const { moviceListId } = lists[moviceIndex]
    //  alert(moviceListId)
    emits('sendFatherSearchLins', {
      moviceListId,
      playType: 'lines',
      searchId: props.searchId,
      itemIndex: moviceIndex
    })
  }

  // 初始化视口监听
  const initViewListenr = function (searchId) {
    if (!moviceRef.value) return
    console.log(searchId);
    const { y, height } = moviceRef.value.getBoundingClientRect()
    const elPosition = y + height
    const wInnerHeight = window.innerHeight
    if (wInnerHeight < elPosition || y <= 0) {
      return
    }
    if (!isPlayIng.value && !exitPlay.value) {
      initHistorys()
    }
  }
  // 修改播放源
  const onAlertPlaySouce = function (source) {
    if (playSource.value == source) return
    playSource.value = source
  }
  // 退出播放
  const onExitPlay = function () {
    isPlayIng.value = false
    exitPlay.value = true
  }
  return {
    isPlayIng,
    onPlayVideo,
    tapIndex,
    startPlay,
    childs,
    playLists,
    playSource,
    playSourceIndex,
    playItem,
    onAlertPlayUrl,
    palyItemjs,
    initHistorys,
    moviceRef,
    initViewListenr,
    exitPlay,
    onAlertPlaySouce,
    onExitPlay
  }
}
const {
  isPlayIng,
  onPlayVideo,
  startPlay,
  playLists,
  playSource,
  playItem,
  onAlertPlayUrl,
  moviceRef,
  initViewListenr,
  initHistorys,
  onAlertPlaySouce,
  onExitPlay
} = useMoviceType()

onMounted(() => {})

watch(
  () => props.list,
  (newList, oldList) => {
    if (newList && !isPlayIng.value) {
      startPlay()
    }
  },
  {
    deep: true
  }
)

defineExpose({
  initViewListenr,
  serchId:props.searchId
})
</script>

<style lang="scss" scoped>
.titles {
  position: relative;
  top: -40px;
  padding: 4px 15px;
  background: #2f2f37;
  left: -20px;
  right: -40px;
  display: flex;
  width: 101.3%;
  justify-content: space-between;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  .left {
    flex: 50%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    box-sizing: border-box;
    color: white;
    font-weight: 600;
  }
  .right {
    flex: 50%;

    display: flex;
    justify-content: end;
    .history {
      color: white;
      font-size: 12px;
      cursor: pointer;
      margin-top:3px;
    }
    .utils {
      margin-left: 5px;
      vertical-align: middle;
    }
  }
}

.moviceType {
  max-height: 80vh;
  overflow: hidden;
  position: relative;

  .items {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    // grid-template-rows: repeat(1, 100%);
    column-gap: 10px;
    row-gap: 10px;
    .item {
      margin-top: 20px;
      cursor: pointer;
      position: relative;
      // overflow: hidden;
      .detail {
        margin-top: 4px;
        .title {
          font-size: 12px;
          display: -webkit-box;
          max-width: 100%;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
          font-weight: bold;
          color: #000000;
        }
        .typeName {
          font-size: 11px;
          margin-top: 2px;
        }
      }
      .img {
        position: relative;
        img {
          width: 100%;
          height: 200px;
        }
        .tag {
          position: absolute;
          background: rgba($color: #000000, $alpha: 0.8);
          color: white;
          font-size: 10px;
          padding: 4px;
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          z-index: 99;
        }
        .task {
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          bottom: 0;
          background: rgba($color: #000000, $alpha: 0.4);
          text-align: center;
          line-height: 180px;
          span {
            font-size: 30px;
            color: white;

            font-weight: bold;
          }
        }
      }
    }
  }

  .video {
    width: 100%;
    height: 400px;
    transition: all 0.3s;

    .container {
      height: 80%;
      background: #000;
    
    }
    .list {
  
      margin-top: 10px;
      overflow-y: scroll;
      display: flex;
      flex-wrap: wrap;
      height: 100px;
      padding-bottom: 20px;
      span {
        margin-right: 10px;
        margin-top: 6px;
        cursor: pointer;
        background: #282828;
        color: #ddd;
        font-size: 10px;
        padding: 6px 12px;
        // margin-bottom: 10px;
        &.active {
          color: white;
          background: orangered;
        }
      }
    }
  }
}
</style>
