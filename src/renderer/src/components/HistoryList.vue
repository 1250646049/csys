<template>
  <div class="history">
    <a-card
      :bordered="false"
      :style="{
        width: '300px',
        height: '300px',
        background: '#444349',
        overflowY: 'scroll',
      }"
    >
      <!-- <template #extra>
        <a-link>更多</a-link>
      </template> -->
      <div @click="onClearHistory()" class="utls" v-if="historys.length">
        <span @click="onClearHistory()">清空</span>
      </div>
      <a-list :split="false" :bordered="false" v-if="historys.length">
        <a-list-item> </a-list-item>
        <a-list-item
          @click="goOnPlay(item)"
          class="aListItem"
          v-for="(item, index) in historys"
          :key="index"
        >
          <div class="left">
            <span>{{ item["vodRemarks"] }}</span>
            <img :src="item['vodPic']" alt="" />
          </div>
          <div class="right">
            <div class="title">{{ `${item["vodName"] + " " + item["number"]}` }}</div>
            <div class="rate">观看至: {{ item["percent"] }}</div>
          </div>
        </a-list-item>
      </a-list>
      <a-empty v-else />
    </a-card>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import useStore from "../store/history";
const store = useStore();
const router = useRouter();
function useHistory() {
  const historys = computed(() => store.getHistorys());
  // 初始化数据

  const onClearHistory = function () {
    store.clearHistory();
  };
  //   继续播放
  const goOnPlay = function (item) {
    if (item["vodId"]) {
      // 跳转视频播放
      router.push({
        name: "play",
        query: {
          type: Number(item["curType"]) ? Number(item["curType"]) : 0,
          vodId: item["vodId"],
          speek: item["currentTime"],
          playSouce: item["playSouce"],
        },
      });
    }
  };
  return {
    historys,
    onClearHistory,
    goOnPlay,
  };
}

const { historys, onClearHistory, goOnPlay } = useHistory();
</script>

<style lang="scss" scoped>
.history {
  position: relative;
  .utls {
    text-align: right;
    height: 10px;
    color: red;

    // background: #000;
    height: 40px;
    position: absolute;
    right: 20px;
    top: 0;
    left: 0;
    line-height: 40px;
    span {
      cursor: pointer;
      padding: 20px;
    }
  }
  .aListItem {
    cursor: pointer;
    display: flex;

    .left {
      position: relative;
      img {
        width: 100px;
        height: 100px;
      }
      span {
        position: absolute;
        max-width: 100%;
        height: 20px;
        text-align: center;
        font-size: 12px;
        color: #333;

        bottom: 0;
        right: 0;
        background: white;
        white-space: normal;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0 2px;
      }
    }
    .right {
      width: 100px;
      display: flex;
      flex-direction: column;
      height: 100px;
      justify-content: space-between;
      .title {
        font-size: 14px;
        color: white;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: all 0.3s;
      }
      .rate {
        color: white;
        font-size: 12px;
      }
    }
    &:hover .title {
      color: #b7541c;
    }
    &:hover span {
      color: #b7541c;
      font-weight: 400;
    }
  }
}
</style>
