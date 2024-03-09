<template>
  <div class="search">
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
      <!-- 搜索 -->
      <div class="searchInput">
        <a-input-search
          allow-clear
          :style="{ width: '240px' }"
          placeholder="告诉我你想看的~"
          v-model="searchContent"
          @input="onSearchInput()"
        >
          <template #append>
            <a-button
              @click="onStartSearch()"
              :style="{
                background: searchContent ? 'orangered' : '#ccc',
                color: searchContent ? 'white' : '#000',
              }"
              >全网搜索</a-button
            >
          </template>
        </a-input-search>
      </div>
      <a-list :split="false" :bordered="false" v-if="lists.length">
        <a-list-item
          @click="onGoDetail(item['vodId'])"
          v-for="(item, index) in lists"
          :key="index"
        >
          <div class="aListItem">
            <img
              style="width: 40px; height: 40px; margin-right: 5px"
              :src="item['vodPic']"
              alt=""
            />
            <div style="flex: 2" class="contents" v-html="item['vodName']"></div>
          </div>
        </a-list-item>
      </a-list>
      <a-empty v-else />
    </a-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { searchMoviceContent } from "../request/conformity";
import { useRouter } from "vue-router";
const router = useRouter();
function useSearch() {
  const lists = ref([]);
  const searchContent = ref("");
  var timer = null;
  //   搜索数据
  const onSearchInput = function () {
    timer && clearTimeout(timer);
    timer = setTimeout(async () => {
      if (!searchContent.value) {
        lists.value.splice(0, lists.value.length);
        return;
      }
      let result = await searchMoviceContent(searchContent.value);
      lists.value = [...result];
    }, 500);
  };
  // 挑战影片详情页
  const onGoDetail = function (vodId) {
    if (!vodId) return;
    router.push({
      name: "detail",
      query: {
        vodId,
      },
    });
  };
  // 开始全网搜索
  const onStartSearch = function () {
    if (!searchContent.value) return;
    router.push({
      name: "playSearch",
      query: {
        vodName: searchContent.value,
        showHeader: 0,
      },
    });
  };
  return {
    lists,
    onSearchInput,
    searchContent,
    onGoDetail,
    onStartSearch,
  };
}

const { lists, onSearchInput, searchContent, onGoDetail, onStartSearch } = useSearch();
</script>

<style lang="scss" scoped>
.search {
  .aListItem {
    color: white;
    font-size: 16px;
    cursor: pointer;
    display: flex;

    .contents {
      width: 80%;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      margin-left: 4px;
      margin-top: 2px;
      vertical-align: middle;
    }
  }
}
</style>
