<template>
  <div class="playDetail" v-if="detail">
    <!-- 首页 -->
    <HeaderCom
      :header-title="detail['vodName'] ? detail['vodName'] : ''"
      :showOther="false"
    />
    <!-- 导航栏 -->
    <IndexRouter :left="0" />
    <!-- 主题内容区域 -->
    <div class="content">
      <DetailBaner :data="detail" :isShowImg="true" />
      <div class="item_list" v-if="Object.keys(playlists)">
        <div class="item_title">选集播放</div>
        <div class="item_content">
          <a-tabs @change="onChangeTabs" position="right">
            <a-tab-pane
              :title="item"
              :key="index"
              v-for="(item, index) in Object.keys(playlists)"
            >
              <div class="playItem">
                <span
                  @click="onStartPlay(detail['vodId'], index)"
                  v-for="(items, index) in playlists[item]"
                  :key="index"
                  >{{ items["label"] }}</span
                >
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import HeaderCom from "../components/HeaderCom.vue";
import IndexRouter from "../components/IndexRouter.vue";
import DetailBaner from "../components/DetailBaner.vue";
import { selectMoviceDetailById } from "../request/conformity";
const route = useRoute();
const router = useRouter();
defineComponent({
  HeaderCom,
  IndexRouter,
  DetailBaner,
});

// 使用视频详情页面
function usePlayDetail() {
  const detail = ref({});
  // 播放列表
  const playlists = computed(() =>
    detail.value["playLists"] ? detail.value["playLists"] : {}
  );
  const playSouce = ref("");
  // 初始化视频详情内容
  const initData = async () => {
    const { vodId } = route.query;
    // 根据视频id 获取视频详情内容
    let result = await selectMoviceDetailById(vodId);
    detail.value = { ...result };
    try {
      playSouce.value = Object.keys(result["playLists"])[0];
    } catch (e) {}
  };

  //跳转播放页面
  const onStartPlay = (vodId, type) => {
    if (!playSouce.value) return;
    router.push({
      name: "play",
      query: {
        vodId,
        type,
        playSouce: playSouce.value,
      },
    });
  };
  // 改变table栏切换
  const onChangeTabs = function (index) {
    let playSource = Object.keys(playlists.value)[index];
    playSouce.value = playSource;
  };
  return {
    initData,
    detail,
    playlists,
    onStartPlay,
    onChangeTabs,
  };
}

const { initData, detail, playlists, onStartPlay, onChangeTabs } = usePlayDetail();
onMounted(() => {
  initData();
});
</script>

<style lang="scss" scoped>
.playDetail {
  overflow: hidden;
  background: rgb(46, 46, 54);
  width: 100vw;
  height: 100%;
  .content {
    margin-top: 45px;
  }
  .item_list {
    box-sizing: border-box;
    padding: 20px;
    .item_title {
      font-size: 20px;
      color: white;
    }
    .item_content {
      margin-top: 10px;
      max-height: 250px;
      overflow-y: scroll;

      .playItem {
        display: flex;
        flex-wrap: wrap;
        span {
          background: white;
          padding: 4px 15px;
          margin-right: 10px;
          margin-bottom: 10px;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
