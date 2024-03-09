<template>
  <div class="other" :style="{ overflow: isFull ? 'hidden' : 'auto' }">
    <!--头部操作按钮  -->
    <HeaderCom
      :fexShowBg="true"
      :isShowBg="true"
      v-if="!isFull"
      :show-other="false"
      header-title="其他播放页面"
    />
    <!-- 播放器 -->
    <div
      :style="{ marginTop: isFull ? 0 : '55px', height: isFull ? '100vh' : '60%' }"
      class="play"
    >
      <!-- 播放器页面 -->
      <div
        :style="{ width: isFull ? '100vw' : '60%' }"
        class="video"
        @click="onIframeClick()"
      >
        <!-- <iframe :src="video.url"></iframe> -->
        <webview @did-finish-load="onWebViewLoadFinish()" :src="video.url"></webview>
      </div>
      <!-- 选集页面 -->
      <div v-if="!isFull && moviceData" class="lists">
        <div class="lists_left">
          <div class="title">{{ moviceData["vodName"] }}</div>
          <div class="tag" v-if="moviceData['vodTag']">
            <span
              style="margin-right: 10px"
              :key="item"
              v-for="item in moviceData['vodTag'].split(',')"
              >{{ item }}</span
            >
          </div>
          <div class="msg">播放失败请切换路线</div>
          <a-divider></a-divider>
          <!-- 工具栏 -->
          <div class="utils">
            <div>切换年份</div>
          </div>
          <div class="play_list" v-if="playVodPlayLists && playVodPlayLists.length">
            <div class="zy" v-if="moviceData['typeName'] == '综艺'">
              <span
                @click="onChangePlayIndex(item, index)"
                :class="
                  playParams.curPlay == playParams.curPlayForm + '_' + index
                    ? 'active'
                    : ''
                "
                v-for="(item, index) in playVodPlayLists"
                :key="index"
                >{{ item["name"] }}</span
              >
            </div>
            <!-- 电视剧|动漫 -->
            <div
              class="dsj"
              v-if="moviceData['typeName'] != '综艺' && moviceData['typeName'] != '电影'"
            >
              <span
                @click="onChangePlayIndex(item, index)"
                :class="
                  playParams.curPlay == playParams.curPlayForm + '_' + index
                    ? 'active'
                    : ''
                "
                v-for="(item, index) in playVodPlayLists"
                :key="index"
                >{{ item["playlink_num"] }}</span
              >
            </div>
            <!-- 电影 -->
            <div class="dy" v-if="moviceData['typeName'] == '电影'">
              <span
                @click="onChangePlayIndex(item, index)"
                :class="
                  playParams.curPlay == playParams.curPlayForm + '_' + index
                    ? 'active'
                    : ''
                "
                v-for="(item, index) in playVodPlayLists"
                :key="index"
                >{{ moviceData["vodName"] + "在线观看" }}</span
              >
            </div>
          </div>
        </div>
        <!-- 播放源 -->
        <div class="lists_right" v-if="moviceData['vodPlayFrom']">
          <div
            @click="onChangePlaySource(index)"
            :class="playParams.vodFormSource == index ? 'active' : ''"
            v-for="(item, index) in moviceData['vodPlayFrom'].split(',')"
            :key="index"
          >
            {{ item }} <span class="circy">8</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 身体部分 -->
    <div class="body" v-if="!isFull">
      <DetailBaner :data="moviceData" :isShowPlay="false" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import HeaderCom from "../components/HeaderCom.vue";
const { ipcRenderer } = require("electron");
import DetailBaner from "../components/DetailBaner.vue";
import { selectMovicePlayData } from "../request/db/detailPlay";
import { parse360KanDetailAddress } from "../request/spide/360kanSpide";
defineProps({
  HeaderCom,
});
const route = useRoute();
function useOtherPlay() {
  const video = ref({
    url: "",
    //   "https://jx.xyflv.top/?url=https://www.iqiyi.com/v_2b74qa2w8ek.html?vfrm=pcw_home&vfrmblk=B&vfrmrst=fcs_0_t11",
  });
  const moviceData = ref({});
  // 是否全屏标识
  const isFull = ref(false);
  const playVodPlayLists = ref([]);
  //   监控元素点击事件
  const initMitt = function () {
    ipcRenderer.on("window-is-full", (_, flag) => {
      if (isFull.value == flag) return;
      isFull.value = flag;
    });
  };
  const playParams = ref({
    vodId: null,
    vodFormSource: null,
    enId: null,
    year: null,
    playIndex: 0,
    curPlayForm: null,
    // 记录当前播放信息 播放源_级数
    curPlay: null,
    playSouce: null,
  });
  // 初始化 路由数据
  const initData = async () => {
    const { vodId, vodFormSource, year, enId, playIndex } = route.query;
    playParams.value.vodFormSource = vodFormSource;
    playParams.value.enId = enId;
    playParams.value.year = year;
    playParams.value.playIndex = playIndex;

    // 根据ID查询数据进行渲染
    try {
      let result = await selectMovicePlayData(vodId);
      if (!result || result.length == 0) return;
      let data = result[0]["data"];
      moviceData.value = JSON.parse(data);
      await initMovicePlayLists();
      // 初始化播放
      initPlay();
    } catch (e) {}

    // video.value.url = "http://www.52pojie.cn";
    // console.log(video.value.url);
  };
  // 初始化 播放器列表数据
  const initMovicePlayLists = async () => {
    const { typeId, vodPlayFrom } = moviceData.value;
    let playFromLists = vodPlayFrom.split(",");
    let curPlayForm = playFromLists[playParams.value.vodFormSource];
    let results = await parse360KanDetailAddress(
      typeId,
      playParams.value.enId,
      Number(playParams.value.year),
      curPlayForm
    );
    console.log(playParams.value);
    let playLists = [];
    if (results["msg"] == "Success") {
      let { defaultepisode, allepidetail, playlinksdetail } = results["data"];
      if (defaultepisode) {
        playLists.push(...defaultepisode);
      } else if (allepidetail && allepidetail[curPlayForm]) {
        playLists.push(...allepidetail[curPlayForm]);
      } else if (playlinksdetail && playlinksdetail[curPlayForm]) {
        playLists.push(playlinksdetail[curPlayForm]);
      }
    }
    playVodPlayLists.value = [...playLists];
    playParams.value.curPlayForm = curPlayForm;
  };
  // 初始化播放
  const initPlay = function (data = null) {
    let item = data ? data : playVodPlayLists.value[playParams.value.playIndex];
    console.log(item);
    let url = "";
    if (item["url"]) {
      url = item["url"];
    } else if (item["default_url"]) {
      url = item["default_url"];
    }
    if (!url) return;
    // todo
    video.value.url="https://www.8090g.cn/jiexi/?url="+url
    // video.value.url = "https://jx.xyflv.top/?url=" + url;
    playParams.value.curPlay =
      playParams.value.curPlayForm + "_" + playParams.value.playIndex;
  };
  // 当播放集数改变时候
  const onChangePlayIndex = function (item, index) {
    // 更新当前播放集数
    if (playParams.value.playIndex == index) return;
    playParams.value.playIndex = index;
    initPlay(item);
  };
  //   加载完成
  const onWebViewLoadFinish = function () {
    // alert("加载完成");
  };
  // onChangePlaySource
  const onChangePlaySource = async function (index) {
    if (playParams.value.vodFormSource == index) return;
    playParams.value.vodFormSource = index;
    // 判断是否需要暂时不显示播放记录
    let curVodFormSource = moviceData.value["vodPlayFrom"].split(",")[index];
    let curPlay = curVodFormSource + "_" + playParams.value.playIndex;
    if (curPlay != playParams.value.curPlay) {
      playParams.value.playIndex = -1;
    } else {
      playParams.value.playIndex = curPlay.split("_")[1];
    }
    playVodPlayLists.value = [];
    await initMovicePlayLists();
  };
  return {
    video,
    initMitt,
    onWebViewLoadFinish,
    isFull,
    initData,
    moviceData,
    playParams,
    playVodPlayLists,
    onChangePlayIndex,
    onChangePlaySource,
  };
}

const {
  video,
  initMitt,
  onWebViewLoadFinish,
  isFull,
  initData,
  moviceData,
  playParams,
  playVodPlayLists,
  onChangePlayIndex,
  onChangePlaySource,
} = useOtherPlay();
onMounted(() => {
  initMitt();
  initData();
});
onBeforeUnmount(() => {
  ipcRenderer.removeListener("window-is-full", () => {});
});
</script>

<style lang="scss" scoped>
.other {
  width: 100%;
  height: 100%;
  background: #2e2e36;
  overflow-y: scroll;
  .play {
    width: 100%;
    display: flex;
    transition: all 0.3s;
    .video {
      background: #000;
      transition: all 0.3s;
      height: 100%;

      webview {
        height: 100%;
        width: 100%;
      }
    }
    .lists {
      width: 40%;
      display: flex;
      .lists_left {
        width: 70%;
        background: #25252b;
        box-sizing: border-box;
        padding: 20px;
        .title {
          color: hsla(189, 60%, 48%);
          font-size: 18px;
        }
        .tag {
          margin-top: 5px;
          font-size: 12px;
          color: hsla(189, 60%, 48%);
        }
        .msg {
          color: white;
          box-sizing: border-box;
          padding: 10px;
          text-align: center;
          background: linear-gradient(90deg, #2eb5c3, #673ab7);
          margin-top: 20px;
          border-radius: 10px;
          margin-bottom: 10px;
        }
        .utils {
          margin-bottom: 10px;
          margin-left: 2px;
          color: white;
          font-size: 14px;
        }
        .play_list {
          max-height: 55%;
          overflow-y: scroll;
          .zy {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            span {
              font-size: 12px;
              margin-top: 5px;
            }
          }
          .dsj {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            font-size: 8px !important;
          }
          .dy {
            width: 100%;
            overflow: hidden;
            span {
              width: 100%;
              overflow: hidden;
              padding: 10px;
            }
          }
          span {
            width: 47%;
            background: #1e1e23;
            font-size: 13px;
            color: white;
            text-align: center;
            box-sizing: border-box;
            padding: 8px 4px;
            cursor: pointer;
            margin-bottom: 5px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            text-overflow: ellipsis;
            &.active {
              background: orangered;
              color: white;
            }
          }
        }
      }
      .lists_right {
        background: #020202;
        box-sizing: border-box;
        padding: 5px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        div {
          background: #141416;
          box-sizing: border-box;
          padding: 10px;
          font-size: 13px;
          font-weight: 500;
          position: relative;
          margin: 4px 0;
          cursor: pointer;
          &.active {
            background: orangered;
            color: white;
          }
          span {
            font-size: 10px;
            position: absolute;
            top: 0;
            right: 0;
            background: #202022;
            width: 15px;
            height: 15px;
            border-radius: 15px;
            text-align: center;
          }
        }
      }
    }
  }
}
</style>
