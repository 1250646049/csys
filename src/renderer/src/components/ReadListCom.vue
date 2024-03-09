<template>
  <div class="readList">
    <div class="cleans" v-if="readLists.length">
      <a-button @click="onCleanList" type="primary" status="danger">清空</a-button>
      <a-divider />
    </div>

    <div class="list_item" v-if="readLists && readLists.length">
      <BookItem
        :item="{
          bookPic: item['bookPic'],
          bookTitle: item['bookTitle'],
          bookAuthor: item['author'],
          bookDetail: item['type'] == 'history' ? `上次看到:` + item['readTitle'] : '',
          type: item['readType'],
          curUrl: item['curUrl'],
          opType: item['type'],
          readId: item['readId'],
          detailPageUrl:item['detailPageUrl']
        }"
        v-for="(item, index) in readLists"
        :key="index"
      />
      <a-divider/>
    </div>
    <a-empty v-else />
  </div>
</template>

<script setup>
import { computed, defineComponent, inject } from "vue";
import BookItem from "./BookItem.vue";
import useStore from "../store/history";
const historyStore = useStore();
const showType = inject("showType");

defineComponent({
  BookItem,
});

function useReadList() {
  const readLists = computed(() =>
    historyStore.$state.readHistory.filter((item) =>{
        return  item["type"] == showType.value;
    })
  );
  //   清空阅读数据
  const onCleanList = function () {
    historyStore.cleanReadList(showType.value);
  };
  return {
    readLists,
    onCleanList,
  };
}
const { readLists, onCleanList } = useReadList();
</script>

<style lang="scss" scoped></style>
