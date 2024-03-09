<template>
  <div class="searchLeft">
    <div class="item">
      云盘资源搜索
      <a-popconfirm @ok="onDeleteYunpanSearch()" content="你确定要清空历史搜索记录吗?">
        <span class="iconfont icon-shanchu1"></span>
      </a-popconfirm>
    </div>
  </div>
</template>

<script setup>
import useSearchStore from '../store/search'
const store = useSearchStore()
/**
 * 删除云盘搜索历史记录
 */
const onDeleteYunpanSearch = function () {
  store.onClearData()
  window.location.reload()
}
</script>

<style lang="scss" scoped>
.searchLeft {
  height: 100%;
  width: 100%;
  background: linear-gradient(to right, #e6e4f1, #e6e3f2, #e8e9ee, #e8e9ec);
  overflow: hidden;
  box-sizing: border-box;
  padding: 5px 7px;
  .item {
    background: linear-gradient(to right, #fdfdfe, #fdfdfd, #ffffff);
    height: 40px;
    width: 100%;
    color: #000;
    // margin: 20px 0;
    margin: 20px 0 20px 0;
    text-align: center;
    line-height: 40px;
    font-size: 13px;
    border-radius: 10px;
    box-sizing: border-box;
    padding-top: 1px;
    cursor: pointer;
    box-shadow: 1px 3px 1px 1px #ccc;
    .icon-shanchu1 {
      margin-left: 10px;
      font-weight: bold;
    }
  }
}
</style>
