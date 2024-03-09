<template>
  <div class="currentHot">
    <IndexWrap @onAlertPosition="onAlertPosition" :maxPage="4" title="猜你喜欢">
      <template #body>
        <div class="body">
          <DetailCard
            v-for="(item, index) in lists"
            :key="index"
            class="item"
            :cardData="{
              title: item['vodName'],
              detail: item['vodContent'],
              pic: item['vodPic'],
              imgHeight: 160,
              ...item,
            }"
          />
        </div>
      </template>
    </IndexWrap>
  </div>
</template>

<script setup>
import { defineComponent, reactive, onMounted, ref } from "vue";
import { selectIndexHotPlay } from "../request/conformity";
import IndexWrap from "./IndexWrap.vue";
import DetailCard from "./DetailCard.vue";
defineComponent({
  IndexWrap,
  DetailCard,
});

// 请求热播精选数据
function useHotRequ() {
  const lists = reactive([]);

  const pageRows = 5;
  // 请求数据
  const initData = async function (pageIndex = 1) {
    try {
      let pastLists = [...lists];
      lists.splice(0, lists.length);
      let results = await selectIndexHotPlay(pageIndex, pageRows);
      if (!results || results.length == 0) {
        lists.push(...pastLists);
      }
      lists.push(...results);
    } catch (e) {}
  };

  // 监听页数改变时候
  const onAlertPosition = function (index) {
    initData(index);
  };

  return {
    lists,
    initData,
    onAlertPosition,
  };
}

const { lists, initData, onAlertPosition } = useHotRequ();
onMounted(() => {
  initData();
});
</script>

<style lang="scss" scoped>
.currentHot {
  .body {
    margin-top: 20px;
    display: grid;
    grid-template-columns: repeat(5,19%);
    column-gap: 15px;

    .item {
      // display: inline-block;
      // width: 18%;
      width: 100%;

      // margin-right: 15px;
    }
  }
}
</style>
