<template>
  <div class="starItem">
    <div @click="onToPlayDetail(lists[0]['vodId'])" class="left" v-if="lists.length">
      <div class="image">
        <span class="tag">{{ lists[0]['vodRemarks'] }}</span>
        <img :src="lists[0]['vodPic']" alt="" />
      </div>
      <div class="detail">
        <span>{{ lists[0]['vodName'] }}</span>
        <span v-html="lists[0]['vodContent']"></span>
      </div>
    </div>
    <div class="right" v-if="lists.length">
      <div v-show="index != 0" class="right_item" :key="index" v-for="(item, index) in lists">
        <DetailCard
          :cardData="{
            title: item['vodName'],
            detail: item['vodContent'],
            pic: item['vodPic'],
            ...item
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineComponent, defineProps } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import DetailCard from './DetailCard.vue'
defineComponent({
  DetailCard
})
defineProps({
  lists: {
    required: true,
    default: []
  }
})

function useIndexStarItem() {
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
const { onToPlayDetail } = useIndexStarItem()
</script>

<style lang="scss" scoped>
.starItem {
  cursor: pointer;
  margin-top: 10px;
  width: 100%;
  display: grid;
  grid-template-columns: 1.3fr 2.2fr;
  column-gap: 20px;
  max-height: 360px;
  .left {
    background: rgb(54, 54, 62);
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    .detail {
      height: 130px;
      overflow-y: scroll;
      &::-webkit-scrollbar {
        width: 0px !important;
      }
      span {
        display: block;
        &:first-child {
          font-size: 18px;
          color: white;
          margin: 25px 0 10px 20px;
          letter-spacing: 1.4px;
        }
        &:last-child {
          color: rgb(198, 198, 200);
          margin: 5px 0 10px 20px;
          font-size: 16px;
          letter-spacing: 1.4px;
          overflow-y: hidden;
        }
      }
    }
    .image {
      position: relative;
      .tag {
        color: white;
        position: absolute;
        right: 10px;
        bottom: 5px;
        font-size: 14px;
      }
      img {
        width: 100%;
        height: 220px;
      }
    }
  }
  .right {
    box-sizing: border-box;
    // padding: 10px 0;
    display: grid;

    width: 100%;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    row-gap: 20px;
    column-gap: 10px;
    grid-template-areas:
      'a b c'
      'd e f';
  }
}
</style>
