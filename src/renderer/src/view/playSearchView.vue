<template>
  <div class="search">
    <!-- 头部 -->
    <HeaderCom
      :show-other="false"
      :fex-show-bg="true"
      :header-title="(curTypeQuery['vodName'] ? curTypeQuery['vodName'] : '') + ' 影片库'"
    />
    <!-- 筛选详情 -->
    <div class="content">
      <!-- 搜索按钮 -->
      <div class="search" style="text-align: center; overflow: hidden">
        <a-input-search
          v-model="searchContent"
          allow-clear
          :style="{ width: '400px' }"
          placeholder="告诉我你想看的~"
          @input="onInputSearch()"
        >
        </a-input-search>
      </div>
      <SearchContent :curTypeQuery="curTypeQuery" />
    </div>
    <IndexRouter />
  </div>
</template>

<script setup>
import { defineComponent,  ref } from "vue";
import HeaderCom from "../components/HeaderCom.vue";
import SearchContent from "../components/SearchContentCom.vue";
import IndexRouter from "../components/IndexRouter.vue";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
defineComponent({
  HeaderCom,
  SearchContent,
  IndexRouter,
});

function useSearch() {
  const curTypeQuery = ref(route.query);
  const searchContent = ref(curTypeQuery.value["vodName"]);

  const onInputSearch = function () {
    curTypeQuery.value["vodName"] = searchContent.value;
    if (!searchContent.value) {
      router.go(0);
    }
  };
  return {
    searchContent,
    curTypeQuery,
    onInputSearch,
  };
}

const { searchContent, curTypeQuery, onInputSearch } = useSearch();
</script>

<style lang="scss" scoped>
.search {
  background: #2e2e36;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  padding: 20px;
  box-sizing: border-box;
  .content {
    margin-top: 50px;
  }
}
</style>
