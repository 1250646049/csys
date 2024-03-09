<template>
  <div class="bookLeft">
    <!-- 小说分类 -->
    <div class="item" v-if="searchShow['cate']">
      <div class="item_title">小说分类</div>
      <div class="item_items">
        <span
          @click="onCategoryClick('cate', item)"
          :class="select['cate'] == item ? 'active' : ''"
          v-for="(item, index) in categorys"
          :key="index"
          >{{ item }}</span
        >
      </div>
    </div>
    <!-- 书源 -->
    <div class="item" v-if="searchShow['source']">
      <div class="item_title">书源切换</div>
      <div class="item_items">
        <span
          @click="onCategoryClick('source', item)"
          :class="select['source'] == item || (!select['source'] && index == 0) ? 'active' : ''"
          v-for="(item, index) in Object.keys(searchConst)"
          :key="index"
          >{{ item }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, ref, inject } from 'vue'
import { searchConst } from '../request/spide/bookSpider/bookConstan'
const emits = defineEmits(['onCategoryClick'])
const searchShow = inject('searchShow')
function useBookLeft() {
  const categorys = ['玄幻', '仙侠', '都市', '历史', '网游', '科幻', '女生', '其他']
  const select = ref({})
  const onCategoryClick = function (type, value) {
    if (select.value[type] == value) return
    select.value[type] = value
    emits('onCategoryClick', {
      type,
      value
    })
  }
  return {
    categorys,
    onCategoryClick,
    select
  }
}
const { categorys, onCategoryClick, select } = useBookLeft()
</script>

<style lang="scss" scoped>
.bookLeft {
  background: #ffffff;
  box-sizing: border-box;
  padding: 10px 10px 15px 10px;
  box-shadow: 1px 1px 2px 0 #ccc;
  // height: 100%;
  .item {
    margin-bottom: 20px;
    .item_title {
      font-size: 15px;
      font-weight: 500;
    }
    .item_items {
      margin-top: 10px;
      font-size: 12px;
      font-weight: 500;
      display: flex;
      flex-wrap: wrap;
      span {
        margin-right: 10px;
        cursor: pointer;
        box-sizing: border-box;
        padding: 2px 4px;
        &.active {
          background: #545357;
          color: white;
        }
      }
    }
  }
}
</style>
