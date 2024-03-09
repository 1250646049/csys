<template>
  <div class="play">
    <div @contextmenu.stop="" ref="dplayer" style="width: 100%; height: 320px" id="dplayer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Hls from 'hls.js'
import DPlayer from 'dplayer'

const props = defineProps({
  playItem: {
    type: Object,
    default: {}
  },
  index: {
    type: Number,
    default: 0
  }
})
function useVideo() {
  const videoPlayer = ref(null)
  const player = ref(null)
  const dplayer = ref(null)
  //   初始化开始播放
  const initPlay = () => {
    // 先默认播放第一部
    let lists = props.playItem
    if (!lists || lists.lenght == 0 || !dplayer.value) return
    let curPlay = lists.find((item) => item['active'] && item['searchId'] == props.index)
    if (!curPlay) return
    player.value = new DPlayer({
      container: dplayer.value,
      hotkey: true,
      autoplay: false,
      video: {
        url: curPlay['url'],
        type: curPlay['playType'] == 'M3U8' ? 'customHls' : curPlay['playType'],
        customType: {
          customHls: function (video, player) {
            const hls = new Hls()
            hls.loadSource(video.src)
            hls.attachMedia(video)
          }
        }
      }
    })
  }

  return { videoPlayer, initPlay, dplayer }
}

const { videoPlayer, initPlay, dplayer } = useVideo()

onMounted(() => {
  initPlay()
})
// 监听切换集数
watch(props, (nev, oldv) => {
  initPlay()
})
</script>

<style lang="scss" scoped></style>
