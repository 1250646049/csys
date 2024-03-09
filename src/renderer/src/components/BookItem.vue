<template>
  <div @click="onToDetail" class="item" v-if="item">
    <div class="img">
      <img v-lazy="item['bookPic']"  alt="" />

    </div>
    <div class="detail" >
      <div class="title">{{ item['bookTitle'] }}</div>
      <!-- 如果作者 -->
      <div class="tag" v-if="item['bookStatus']">
        <span class="type">{{ item['bookStatus'] }}</span>
        <!-- <span class="number">字数: 20000万字</span> -->
      </div>
      <!-- 作者 -->
      <div
        :style="{ marginBottom: 8 + 'px', marginTop: 8 + 'px' }"
        class="author"
        v-if="item['bookAuthor']"
      >
        作者 {{ item['bookAuthor'] }}
      </div>
      <div class="contents">
        {{ item['bookDetail'] }}
      </div>
      <!-- 显示删除按钮 -->
      <div class="del" v-if="item['opType']">
        <a-button @click.stop="onDeleteSingleRead()" status="warning" style="margin-top: 10pxpx"
          >删除</a-button
        >
      </div>
      <div class="bottom" v-if="item['bookUpdate']">
        <span class="update"> 更新时间：{{ item['bookUpdate'] }} </span>
        <span class="bottom_tag"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
import useStore from '../store/history'
const historyStore = useStore()
const router = useRouter()
const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: {}
  }
})
function useBookItem() {
  // 去往小说详情页
  const onToDetail = function () {
    const { type, bookSrc, opType = '', detailPageUrl } = props.item
    router.push({
      name: 'bookDetail',
      query: {
        type,
        url: opType ? detailPageUrl : bookSrc,
        opType
      }
    })
  }
  // 删除单个小说数据
  const onDeleteSingleRead = function () {
    const { readId } = props.item
    if (!readId) return
    historyStore.deleteReadListById(readId)
  }
  return {
    onToDetail,
    onDeleteSingleRead
  }
}

const { onToDetail, onDeleteSingleRead } = useBookItem()
</script>

<style lang="scss" scoped>
.item {
  display: flex;
  background: white;
  box-sizing: border-box;
  padding: 5px;
  margin-right: 10px;
  // margin-bottom: 8px;
  //   max-height: 160px;
  height: 160px;
  cursor: pointer;

  .img {
    margin-right: 10px;

    img {
      width: 100px;
      height: 140px;
    }
  }
  .detail {
    .title {
      font-size: 14px;
      color: #000;
    }
    .tag {
      margin: 4px 0;
      display: flex;
      justify-content: space-between;
      span {
        font-size: 11px;
        white-space: nowrap;
        &.type {
          color: #67a2d8;
          border: 1px solid #67a2d8;
          padding: 2px;
        }
        &.number {
          color: #b8232f;
          margin-top: 2px;
        }
      }
    }
    .author {
      font-size: 12px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .contents {
      font-size: 12px;
      margin: 4px 0;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
      text-overflow: ellipsis;
      text-indent: 1.5em;
    }
    .bottom {
      margin-top: 10px;
      .update {
        font-size: 10px;
      }
    }
  }
}
</style>
