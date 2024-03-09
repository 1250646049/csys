<template>
  <div class="detailCard" v-if="cardData" @click="onToPlayDetail(cardData['vodId'])">
    <div class="img">
      <span v-if="cardData['vodRemarks']">{{ cardData['vodRemarks'] }}</span>
      <!--   :src="cardData['pic']" -->
      <img
        v-lazy="cardData['pic']"
        :style="{
          height: cardData && cardData['imgHeight'] ? cardData['imgHeight'] + 'px' : '100px'
        }"
      
        alt=""
      />
    </div>

    <div class="title">
      {{ cardData && cardData['title'] ? cardData['title'] : '未知影片名称' }}
    </div>
    <div class="detail" v-if="cardData">
      <span v-html="cardData['detail'] ? cardData['detail'] : '暂无更多详情介绍~'"></span>
      <!-- {{  ? cardData["detail"] : "未知影片介绍" }} -->
    </div>
    <div class="task" v-html="cardData['detail'] ? cardData['detail'] : '暂无更多详情介绍~'"></div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
defineProps({
  cardData: {
    type: Object,
    required: true
  }
})

function useDetailCard() {
  // 进去影片详情页
  const onToPlayDetail = function (vodId) {
    router.push({
      name: 'detail',
      query: {
        vodId
      }
    })
  }

  return {
    onToPlayDetail
  }
}
const { onToPlayDetail } = useDetailCard()
</script>

<style lang="scss" scoped>
.detailCard {
  cursor: pointer;
  width: 100%;
  position: relative;
  &:hover  .task {
    display: block;
  }
  .title {
    font-size: 14px;
    width: 100%;
    color: white;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 4px 0 2px 0;
    letter-spacing: 1.1px;
    max-height: 40px;
  }
  .detail {
    // width: 100% !important;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 250px !important;
    // background: #2e2e36 !important;
    // color: #5D493E !important;
    color: #666666 !important;
  }
  .task {
    background: rgba($color: #131212, $alpha: 0.9);
    position: absolute;
    display: none;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 99;
    color: white;
    font-weight: 500;
    box-sizing: border-box;
    padding: 10px;
    text-indent: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 24px;
    font-size: 12px;
    overflow-x: hidden;
  word-wrap:break-word;
  &::-webkit-scrollbar {
    width: 0px !important;
  }
  }
  .img {
    position: relative;
    img {
      width: 100%;
      border-radius: 4px;
    }
    span {
      position: absolute;
      background: rgba($color: #000000, $alpha: 0.5);
      font-size: 12px;
      color: white;
      padding: 3px 8px;
      max-width: 100%;
      bottom: 0;
      right: 0;
    }
  }
  .detail {
    font-size: 12px;
    font-weight: 500;
    width: 100%;
    height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    word-wrap: break-word;
  }
}
</style>
