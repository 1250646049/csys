<template>
  <div class="baner" v-if="data">
    <div class="title">{{ data["vodName"] }}</div>
    <!-- 标签 -->
    <div class="tag">
      <div v-if="data['vodYear']">
        <span>{{ data["vodYear"] }}</span>
      </div>
      <div>
        <span v-if="data['vodArea']">{{ data["vodArea"] }}</span>
        <span v-if="data['vodLang']">{{ data["vodLang"] }}</span>
      </div>
      <div v-if="data['typeName']">{{ data["typeName"] }}</div>
      <div v-if="data['vodRemarks']">{{ data["vodRemarks"] }}</div>
      <div v-if="data['vodScore']">{{ data["vodScore"] + "分" }}</div>
    </div>
    <!-- 详细介绍 -->
    <div class="detail">
      <!-- 左边介绍 -->
      <div class="detail_left">
        <div
          class="detail_all"
          v-if="data['vodContent']"
          v-html="data['vodContent']"
        ></div>
        <!-- 影片参与人员 -->
        <ul class="about">
          <li>
            <strong>导演：</strong>
            <span v-if="data['vodDirector']">{{ data["vodDirector"] }}</span>
          </li>
          <li v-if="data['vodActor']">
            <strong style="margin-right: 10px">主演:</strong>
            <span v-for="item in data.vodActor.split(',')" :key="item">{{ item }}</span>
          </li>
        </ul>
        <div class="utils">
          <span v-if="isShowPlay" @click="onStartPlay(data['vodId'], 0)" class="playing"
            >立即播放</span
          >
        </div>
      </div>
      <!-- 右边图片 -->

      <div
        @click="onStartPlay(data['vodId'], 0)"
        v-if="isShowImg && data['vodPic']"
        class="detail_img"
      >
        <img :src="data['vodPic']" alt="" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const props = defineProps({
  isShowPlay: {
    type: Boolean,
    default: true,
  },
  isShowImg: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    required: true,
    default: {},
  },
});

function useDetailBaner() {
  const onStartPlay = function (vodId, type) {
    const { playLists } = props.data;
    let keys = Object.keys(playLists);
    let curPlaySource = keys[0];
    router.push({
      name: "play",
      query: {
        vodId,
        type,
        playSouce: curPlaySource,
      },
    });
  };
  return {
    onStartPlay,
  };
}

const { onStartPlay } = useDetailBaner();
</script>

<style lang="scss" scoped>
.baner {
  background: rgb(241, 242, 243);
  padding: 6px;
  .title {
    font-size: 20px;
    color: #000;
    font-weight: 700;
    position: relative;
    padding-left: 14px;
    &::after {
      display: block;
      content: "";
      position: absolute;
      width: 4px;
      height: 26px;
      background: rgb(229, 9, 20);
      left: 0;
      top: 2px;
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
    }
  }
  .tag {
    margin-top: 15px;
    display: flex;
    div {
      padding: 3px 6px;
      background: white;
      margin-right: 10px;
      border-radius: 8px;
    }
    span {
      margin-right: 10px;
      position: relative;
      padding-right: 4px;
      &:last-child::before {
        display: none !important;
      }
      &::before {
        display: block;
        content: "";
        position: absolute;
        width: 1px;
        background: #bcbccb;
        z-index: 66;
        right: -5px;
        top: 2px;
        bottom: 2px;
        transform: rotate(15deg);
      }
    }
  }

  .detail {
    margin-top: 10px;
    background: white;
    padding: 20px;
    box-sizing: border-box;
    box-shadow: 1px 2px 1px 1px #eee;
    display: flex;

    .detail_left {
      flex: 3;
      .detail_all {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .about {
        margin-top: 10px;
        border-top: 1px solid #ccc;
        padding-top: 8px;
        li {
          margin-bottom: 8px;
          strong {
            color: #000;
          }
          span {
            position: relative;
            font-size: 13px;
            padding-right: 4px;
            margin-right: 15px;
            &:last-child::before {
              display: none !important;
            }
            &::before {
              display: block;
              content: "";
              position: absolute;
              width: 1px;
              background: #bcbccb;
              z-index: 66;
              right: -5px;
              top: 2px;
              bottom: 2px;
              transform: rotate(15deg);
            }
          }
        }
      }
      .utils {
        margin-top: 30px;
        .playing {
          background: linear-gradient(to right, #ff711f 0%, #e50914 100%);
          color: white;
          box-shadow: 0 10px 12px -4px rgba(229, 9, 20, 0.25);
          transition: box-shadow 0.2s ease;
          padding: 8px 25px;
          cursor: pointer;
          border-radius: 15px;
        }
      }
    }
    .detail_img {
      flex: 1;
      text-align: center;
      img {
        width: 80%;
        height: 250px;
        transform: translateY(-50px);
      }
    }
  }
}
</style>
