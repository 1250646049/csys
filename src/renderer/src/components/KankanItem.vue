<template>
  <div class="item" v-if="data">
    <div class="left">
      <div class="tag" v-if="data['coverInfo']">
        <span :key="index" v-for="(item, index) in Object.values(data['coverInfo'])">{{
          item
        }}</span>
      </div>
      <img :src="data['vodPic']" alt="" />
    </div>
    <div class="right">
      <div class="title">
        <div class="name">{{ data["vodName"] }}</div>
        <div class="title_tag">
          <span v-if="data['typeName']">{{ data["typeName"] }}</span>
          <span v-if="data['vodYear']">{{ data["vodYear"] }}</span>
        </div>
      </div>
      <!-- 地区 -->
      <div class="subtitle">
        <div v-if="data['vodArea']" class="subitem">
          <strong>地区：</strong>
          <span>{{ data["vodArea"] }}</span>
        </div>
        <div style="max-width: 200px" v-if="data['vodDirector']" class="subitem">
          <strong>{{ data["typeName"] == "综艺" ? "主持:" : "导演:" }}</strong>
          <span
            v-for="(item, index) in data['vodDirector'].split(',')"
            :key="index"
            class="tag"
            >{{ item }}</span
          >
        </div>
      </div>
      <!-- 播放器选择 -->
      <div class="play_type" v-if="playList">
        <strong style="margin-right: 10px">播放源:</strong>
        <a-select
          @change="onChangeSelect"
          :defaultValue="curShowPlayNumber"
          :style="{ width: '120px' }"
        >
          {{ item }}
          <a-option :value="index" :key="index" v-for="(item, index) in playList">{{
            item["vod_play_from"]
          }}</a-option>
        </a-select>
      </div>
      <!-- 影片简介 -->
      <div v-if="data['vodContent']" class="detail">
        <span>简介:</span>
        <p>
          {{ data["vodContent"] }}
        </p>
      </div>

      <!-- 如果是综艺片 有可能会出现多年份的情况 -->
      <div v-if="years" class="more_year">
        <span
          @click="onYearChnage(itemY)"
          :class="curYear == itemY || (curYear == 0 && indexY == 0) ? 'active' : ''"
          v-for="(itemY, indexY) in years"
          :key="indexY"
          >{{ itemY }}</span
        >
      </div>
      <!-- 选集 -->
      <div
        v-if="data['playList'] && data['playList'].length"
        class="lists"
        :class="data['typeName'] == '综艺' ? 'two' : 'three'"
      >
        <!-- 选集列表 -->
        <div
          v-for="(items, indexs) in playList[curShowPlayNumber]['vod_play_list']"
          :key="indexs"
          class="items"
        >
          <!-- 综艺和其他类别所要呈现的方式不一样 -->
          <div
            @click="onToPlay(items, indexs)"
            class="zy"
            v-if="data['typeName'] == '综艺'"
          >
            <span v-if="items['period']">{{ items["period"] }}</span>
            <span style="margin-left: 5px" v-if="items['name']">{{ items["name"] }}</span>
          </div>
          <div v-if="data['typeName'] == '电影'">
            <span @click="onToPlay(items, indexs)">{{
              data["vodName"] + "在线观看"
            }}</span>
          </div>
          <!-- 非综艺  非电影-->
          <div v-if="data['typeName'] != '综艺' && data['typeName'] != '电影'">
            <span @click="onToPlay(items, indexs)">{{ indexs + 1 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed, onMounted, ref, nextTick } from "vue";
import { insertMoviceSearchHistory } from "../request/db/detailPlay";
import { useRouter } from "vue-router";
const props = defineProps({
  data: {
    required: true,
    default: {},
  },
});
const router = useRouter();
function useKankanItem() {
  // 播放列表
  const playList = computed(() => props.data && props.data["playList"]);
  const curShowPlayNumber = ref(0);
  // 年份列表
  const years = computed(() => props.data && props.data["years"]);
  // 定义一个当前年索引
  const curYear = ref(0);
  // 定义一个当前播放源
  const curSource = ref("");
  const initData = function () {
    curYear.value = years.value ? years.value[0] : 0;
    curSource.value = playList.value ? Object.keys(playList.value)[0] : "";
  };
  // 改变播放源
  const onChangeSelect = function (e) {
    if (e == curShowPlayNumber.value) return;
    curShowPlayNumber.value = e;
  };
  // 准备去播放页面
  const onToPlay = async function (item, index) {
    // 将数据整合 插入数据库
    try {
      let id = await insertMoviceSearchHistory(props.data);
      // 携带id进行跳转
      router.push({
        name: "otherPlay",
        query: {
          vodId: id,
          vodFormSource: curShowPlayNumber.value,
          enId: props.data["en_id"],
          year: curYear.value,
          playIndex: index,
        },
      });
    } catch (e) {
      console.log(e);
    }
  };
  // 当年份改变时
  const onYearChnage = function (year) {
    if (curYear.value == year) return;
    curYear.value = year;
    // 根据年份获取播放内容
    const { en_id, typeId } = props.data;
    let curPlayLists = playList.value[curShowPlayNumber.value];
    let playSource = curPlayLists["vod_play_from"];
    // 请求播放列表
  };
  return {
    playList,
    initData,
    years,
    curYear,
    curSource,
    curShowPlayNumber,
    onChangeSelect,
    onToPlay,
    onYearChnage,
  };
}

const {
  playList,
  initData,
  years,
  curYear,
  curSource,
  curShowPlayNumber,
  onChangeSelect,
  onToPlay,
  onYearChnage,
} = useKankanItem();
onMounted(() => {
  initData();
});
</script>

<style lang="scss" scoped>
.item {
  margin-top: 20px;
  display: flex;
  margin-bottom: 20px;

  .left {
    width: 20%;
    position: relative;
    img {
      width: 100%;
      height: 200px;
    }
    .tag {
      position: absolute;
      font-size: 10px;

      right: 0;
      bottom: 115px;
      span {
        color: #000000;
        background: rgba($color: #ccc, $alpha: 0.6);
        padding: 4px 6px;
      }
    }
  }
  .right {
    margin-left: 20px;
    width: 70%;
    position: relative;
    .play_type {
      position: absolute;
      top: 40px;
      right: 10px;
    }
    .title {
      display: flex;
      .name {
        font-size: 20px;
        color: #000000;
      }
      .title_tag {
        margin-left: 10px;
        font-size: 12px;
        margin-top: 10px;
        span {
          vertical-align: middle;
          margin-right: 4px;
          color: #000000;
        }
      }
    }
    .subtitle {
      display: flex;
      margin-top: 10px;
      .subitem {
        margin-right: 20px;
        color: #000000;
        position: relative;

        strong {
          letter-spacing: 1.6px;
          margin-right: 8px;
          font-size: 14px;
        }
        .tag {
          margin-right: 4px;
          padding-right: 10px;
          color: #1db69a;
        }
      }
    }
    .detail {
      margin-top: 10px;
      display: flex;
      span {
        margin-right: 15px;
        font-size: 14px;
        color: #000000;
        white-space: nowrap;
        font-weight: bold;
      }
      p {
        display: -webkit-box;
        color: #000000;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        text-overflow: ellipsis;
        // max-width: 60%;
        // max-height: 40px;
        font-size: 12px;
      }
    }
    .more_year {
      margin: 8px 0;
      display: flex;
      flex-wrap: wrap;
      span {
        font-size: 12px;
        color: #333;
        background: white;
        padding: 2px 6px;

        border-radius: 8px;
        cursor: pointer;
        margin-right: 6px;
        margin-bottom: 6px;
        &.active {
          background: #ff4500;
          color: white;
        }
      }
    }
    .lists {
      margin-top: 15px;
      max-height: 150px;
      overflow-y: scroll;
      overflow-x: hidden;
      position: relative;

      &.two {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 25px 25px;
        column-gap: 15px;
        row-gap: 15px;
      }
      &.three {
        display: flex;
        flex-wrap: wrap;
        .items {
          margin-right: 10px;
          padding: 3px 12px;
          margin-bottom: 10px;
        }
      }
      .items {
        background: #444349;
        // line-height: 36px;
        box-sizing: border-box;
        color: white;
        text-align: center;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 12px;
        padding: 4px 10px;
        &:hover {
          background: #ff5f00;
        }
        span {
          cursor: pointer;
        }
      }
    }
  }
}
</style>
