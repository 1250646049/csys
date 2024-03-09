<template>
  <!--头部操作按钮  -->
  <HeaderCom :show-other="false" :header-title="playIngTitle" />
  <div class="play" v-if="detail">
    <!-- 播放器区域 -->
    <div class="playContainer" ref="playContainer">
      <video ref="videoPlayer" class="video-js video"></video>
      <div class="playRight">
        <!-- 视频简单介绍 -->
        <div class="title">{{ detail["vodName"] }}</div>
        <div class="detail">{{ detail["vodRemarks"] }}</div>
        <!-- 工具栏 -->
        <div class="utils" v-if="playlists">
          <a-popover position="bottom">
            <div class="select_play">切换播放源 <icon-caret-down /></div>
            <template #content>
              <div class="playSource" style="text-align: center">
                <a-tag
                  @click="onChangePlaySource(item)"
                  :key="item"
                  v-for="item in Object.keys(playlists)"
                  style="margin-bottom: 5px; cursor: pointer"
                  :color="curPlaySouce == item ? 'red' : '#ccc'"
                >
                  {{ item }}
                </a-tag>
              </div>
            </template>
          </a-popover>
        </div>
        <!-- 播放list -->
        <div class="playList" v-if="playlists[curPlaySouce]">
          <span
            @click="onTabNextPaly(index, 'click')"
            :class="okPlaySouce == curPlaySouce && curType == index ? 'active' : ''"
            v-for="(item, index) in playlists[curPlaySouce]"
            :key="index"
            >{{ item["label"] }}</span
          >
        </div>
      </div>
    </div>
    <!-- 选集列表 -->
    <div class="list">
      <!-- 影片介绍 -->
      <DetailBaner :data="detail" :is-show-play="false" />
    </div>
  </div>
</template>

<script setup>
import {
  defineComponent,
  onMounted,
  ref,
  computed,
  nextTick,
  watch,
  onBeforeUnmount,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import HeaderCom from "../components/HeaderCom.vue";
import { IconCaretDown } from "@arco-design/web-vue/es/icon";
const { ipcRenderer } = require("electron");
import videojs from "video.js";
import "video.js/dist/video-js.css";
import DetailBaner from "../components/DetailBaner.vue";
import { selectMoviceDetailById } from "../request/conformity";
import useStore from "../store/history";
const route = useRoute();
const router = useRouter();
const store = useStore();
defineComponent({
  HeaderCom,
  IconCaretDown,
  DetailBaner,
});

function usePlay() {
  const videoPlayer = ref(null);
  const playContainer = ref(null);
  const player = ref(null);
  const detail = ref({});

  // 播放列表
  const playlists = computed(() =>
    detail.value["playLists"] ? detail.value["playLists"] : {}
  );

  // 当前播放影片的id
  const curVodId = ref(null);
  // 当前开始播放的集数
  const curType = ref(0);
  // 当前播放源的列表
  const curPlayLists = ref([]);
  // 当前播放url地址
  const curPlayUrlAddress = ref(null);
  // 当前播放对象
  const curPlayObject = ref(null);
  // 当前播放源
  const curPlaySouce = ref(null);

  const okPlaySouce = ref(null);
  const playIngTitle = computed(
    () =>
      `正在播放: ${detail.value["vodName"]} ${
        curPlayObject.value ? curPlayObject.value["label"] : ""
      }`
  );
  // 初始化默认播放内容
  const initPlay = function (url, speek = null) {
    if (!url) return;
    curPlayUrlAddress.value = url;
    player.value = videojs(videoPlayer.value, {
      // poster: "//vjs.zencdn.net/v/oceans.png",//视频封面照片
      controls: true, //视频控件
      autoplay: true, //自动播放
      muted: false, //是否设置默认音频 false静音
      loop: false, //是否循环播放
      notSupportedMessage: false, //是否允许重写默认的消息显示出来时，video.js无法播放媒体源
      preload: "metadata", //建议浏览器是否在加载<video>元素时开始下载视频数据。(预加载)
      fluid: false, //是否自适应布局,播放器将会有流体体积。换句话说，它将缩放以适应容器。
      sources: [
        {
          src: url, //播放视频地址
          type: "application/x-mpegURL", //播放m3u8需要设置的格式
        },
      ],

      controlBar: {
        remainingTimeDisplay: {
          displayNegative: false,
        },
      },
      playbackRates: [0.5, 1, 1.5, 2, 2.5, 3], //设置播放速度
    });
    if (speek) {
      player.value.currentTime(speek);
    }
    //  开始播放
    player.value.on("play", (e) => {
      // 开始播放
      console.warn("开始播放视频");
    });
    // 监控播放改变时
    player.value.on("timeupdate", (e) => {});
    player.value.on("error", (e) => {
      alert("播放失败");
    });
    player.value.on("ended", (e) => {
      console.warn("播放结束");
      // 继续播放下一步
      let index = Number(curType.value);
      if (curPlayLists.value && curPlayLists.value.length > 0) {
        if (index + 1 <= curPlayLists.value.length - 1) {
          onTabNextPaly(index + 1);
        } else {
          onTabNextPaly(0);
        }
      }
    });
  };
  // 初始化数据
  const initData = async function () {
    const { vodId, type, speek, playSouce } = route.query;
    curVodId.value = vodId;
    curType.value = type;

    curPlaySouce.value = playSouce;
    okPlaySouce.value = playSouce;
    // 请求详情数据
    // 根据视频id 获取视频详情内容
    let result = await selectMoviceDetailById(vodId);
    detail.value = { ...result };
    let curPlayList = detail.value["playLists"];
    if (curPlayList) {
      curPlayLists.value = curPlayList[curPlaySouce.value];
      let playObject = curPlayList[curPlaySouce.value][curType.value];
      curPlayObject.value = { ...playObject };
      // 开始播放
      nextTick(() => {
        initPlay(playObject["playUrl"], speek);
      });
    }
  };

  // 切换下一集播放
  const onTabNextPaly = function (index, type = "auto") {
    if (type == "click" && okPlaySouce.value != curPlaySouce.value) {
      okPlaySouce.value = curPlaySouce.value;
    }
    curType.value = index;
    try {
      // let playObject = curPlayLists.value[index];
      // let nexPlayUrl = playObject["playUrl"];
      router.push({
        name: "play",
        query: {
          vodId: detail.value["vodId"],
          type: index,
          playSouce: okPlaySouce.value,
        },
      });
    } catch (e) {}
  };

  // 加入播放历史
  const addPlayHistory = function () {
    // 获取数据 加入历史记录里面
    detail.value["currentTime"] = player.value.currentTime();
    detail.value["playLists"] = [];
    detail.value["number"] = curPlayObject.value["label"];
    detail.value["totalTime"] = player.value.duration();
    // 记录级数
    detail.value["curType"] = curType.value;
    // 记录播放源
    detail.value["playSouce"] = okPlaySouce.value;
    let percent =
      Math.floor((player.value.currentTime() / player.value.duration()) * 100).toFixed(
        0
      ) + "%";
    detail.value["percent"] = percent ? percent : "100%";
    store.insertPlayHistory(detail.value);
    player.value.dispose();
  };

  // 切换播放源
  const onChangePlaySource = function (playSource) {
    if (curPlaySouce.value == playSource) return;
    curPlaySouce.value = playSource;
  };

  return {
    initPlay,
    videoPlayer,
    initData,
    detail,
    playlists,
    curPlaySouce,
    curType,
    onTabNextPaly,
    playContainer,
    playIngTitle,
    addPlayHistory,
    onChangePlaySource,
    okPlaySouce,
  };
}

const {
  videoPlayer,
  initData,
  detail,
  playlists,
  curPlaySouce,
  curType,
  onTabNextPaly,
  playContainer,
  playIngTitle,
  addPlayHistory,
  onChangePlaySource,
  okPlaySouce,
} = usePlay();

// 监控本地路由变化重新加载：因为video.js 单纯修改播放地址不会触发重绘播放，所以需要动态的加载路由
watch(route, (newV, oldV) => {
  window.location.reload();
});
onBeforeUnmount(() => {
  // 加入播放历史
  addPlayHistory();
});
onMounted(() => {
  initData();
});
</script>

<style lang="scss" scoped>
.play {
  background: #2e2e36;
  overflow: hidden;
  .playContainer {
    margin-top: 45px;
    height: 70vh;
    display: flex;
    width: 100%;
    .video {
      width: 60%;
      height: 100%;
    }
    .playRight {
      box-sizing: border-box;
      padding: 10px;
      width: 40%;
      box-sizing: border-box;
      padding: 5px 0 0 10px;

      .title {
        font-size: 18px;
        color: white;
      }
      .detail {
        margin-top: 10px;
        font-weight: 500;
        font-size: 14px;
      }
      .utils {
        margin-right: 20px;
        text-align: right;
        .select_play {
          display: inline-block;
          cursor: pointer;
          color: white;
          font-size: 14px;
        }
      }
      .playList {
        margin-top: 10px;
        overflow-y: scroll;
        max-height: 80%;
        display: flex;
        flex-wrap: wrap;
        span {
          background: rgb(68, 67, 73);
          padding: 4px 10px;
          height: 20px;
          cursor: pointer;
          text-align: center;
          margin-right: 10px;
          margin-bottom: 10px;
          color: white;
          font-size: 12px;
          &.active {
            background: rgb(255, 95, 0);
          }
        }
      }
    }
  }
  .list {
    margin-top: 20px;
    // padding: 20px;
    box-sizing: border-box;
  }
}
</style>
