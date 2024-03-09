<template>
  <div class="content">
    <!-- 头部切换栏目 -->
    <div class="header" v-if="curType">
      <span
        @click="onChangeType(item)"
        :class="curType == item ? 'active' : ''"
        :key="index"
        v-for="(item, index) in Object.keys(typeSearchList)"
        >{{ item + "片场" }}</span
      >
    </div>
    <!-- 中间详情内容 -->
    <ul class="center" v-if="curType">
      <li>
        <span class="label">全部剧情</span>
        <div class="tag">
          <span
            @click="onAlterSearchContent('typeName', items)"
            :class="items == searchObject.typeName ? 'active' : ''"
            v-for="(items, index) in typeSearchList[curType]['childs']"
            :key="index"
            >{{ items }}</span
          >
        </div>
      </li>
      <li>
        <span class="label">全部地区</span>
        <div class="tag">
          <span
            @click="onAlterSearchContent('vodArea', items)"
            :class="items == searchObject.vodArea ? 'active' : ''"
            v-for="(items, index) in allAddressList"
            :key="index"
            >{{ items }}</span
          >
        </div>
      </li>
      <li>
        <span class="label">全部时间</span>
        <div class="tag">
          <span
            @click="onAlterSearchContent('vodYear', items)"
            :class="items == searchObject.vodYear ? 'active' : ''"
            v-for="(items, index) in allTimeSearchFun()"
            :key="index"
            >{{ items }}</span
          >
        </div>
      </li>
      <li>
        <span class="label">时间排序</span>
        <div class="tag">
          <span
            @click="onAlterSearchContent('vodType', !searchObject.vodType)"
            :class="searchObject.vodType ? 'active' : ''"
            >评分优先</span
          >
        </div>
      </li>
      <!-- 统计总数 -->
      <li class="total" v-if="data.total">
        影片库为你选出{{ data["total"]["count"] }}部影片
      </li>
    </ul>

    <!-- 显示全网搜索的内容 暂时只显示360的搜索结果 -->
    <div class="360kan" v-if="!curType && searchObject.vodName">
      <a-collapse>
        <a-collapse-item
          style="background-color: black"
          :header="'全网搜索 《' + searchObject.vodName + '》 结果'"
          key="1"
        >
          <KankanCom :vodName="searchObject.vodName" />
        </a-collapse-item>
      </a-collapse>
    </div>

    <!-- body -->
    <div class="body" v-if="data && data['lists']">
      <DetailCard
        :cardData="{
          title: item['vodName'],
          detail: item['vodContent'],
          pic: item['vodPic'],
          imgHeight: 160,
          ...item,
        }"
        v-for="(item, index) in data['lists']"
        :key="index"
      />
      <!-- 重新同步 -->
      <div @click="onSyncByName()" class="sync" v-if="data['total']['count'] < pageRows">
        <span>找不到需要的影片?</span>
        <span>点我启动超强搜索吧!</span>

        <div style="text-align: center" class="loading" v-if="isIngSearch">
          <a-spin :size="32" />
        </div>
      </div>
    </div>
  </div>
  <!-- 分页 -->
  <div class="paginter" v-if="data['total']">
    <a-pagination
      @change="onPaginationChange"
      :total="data['total']['count']"
      :page-size="pageRows"
      :current="curIndex"
      show-total
    />
  </div>
</template>

<script setup>
import {
  onMounted,
  ref,
  defineComponent,
  defineProps,
  watch,
  defineAsyncComponent,
  onBeforeUnmount,
} from "vue";
import { useRouter } from "vue-router";
import {
  typeSearchList,
  allAddressList,
  allTimeSearchFun,
} from "../config/indexConstConfig";
import { searchAllMovice } from "../request/conformity";
import DetailCard from "./DetailCard.vue";
const { ipcRenderer } = require("electron");
const KankanCom = defineAsyncComponent(() => import("./kankanCom.vue"));

defineComponent({
  DetailCard,
  KankanCom,
});
const props = defineProps({
  curTypeQuery: {
    required: false,
    default: {},
  },
});
function useSearchContent() {
  const curType = ref(
    props.curTypeQuery["vodName"]
      ? ""
      : props.curTypeQuery["curType"]
      ? props.curTypeQuery["curType"]
      : Object.keys(typeSearchList)[0]
  );
  const searchObject = ref({
    bigType: curType.value,
    typeName: "",
    vodName: props.curTypeQuery["vodName"] ? props.curTypeQuery["vodName"] : "",
    vodLang: "",
    vodArea: "",
    vodYear: "",
    // 默认时间排序 否则评分排序
    vodType: false,
  });
  const data = ref({});
  const pageRows = 30;
  const curIndex = ref(1);
  const isIngSearch = ref(false);
  // 开始触发搜索
  const initData = async (pageIndex = 1, object = searchObject.value) => {
    data.value = {};
    let result = await searchAllMovice(object, pageIndex, pageRows);
    data.value = { ...result };
  };

  const onChangeType = function (type) {
    if (curType.value == type) return;
    curType.value = type;
    searchObject.value.bigType = type;
    searchObject.value.typeName = "";
    initData();
  };
  const onAlterSearchContent = function (key, value) {
    searchObject.value[key] = value;
    initData();
  };

  // 分页改变时
  const onPaginationChange = function (e) {
    curIndex.value = e;
    initData(e);
  };
  // 根据名称重新获取下数据
  function onSyncByName() {
    if (searchObject.value.vodName) {
      isIngSearch.value = true;
      ipcRenderer.send("onSyncByName", searchObject.value.vodName);
    }
  }
  // 监听事件 爬虫根据名称搜索后返回给窗口信息
  function initEvent() {
    ipcRenderer.on("sednMainWindowBySearchEvent", () => {
      // 可能是异步的所以延迟五秒左右
      setTimeout(() => {
        if (isIngSearch.value == false) return;
        isIngSearch.value = false;
        initData(1);
      }, 5000);
    });
  }
  return {
    initData,
    curType,
    onChangeType,
    searchObject,
    onAlterSearchContent,
    data,
    pageRows,
    onPaginationChange,
    curIndex,
    onSyncByName,
    initEvent,
    isIngSearch,
  };
}

const {
  initData,
  curType,
  onChangeType,
  searchObject,
  onAlterSearchContent,
  data,
  pageRows,
  onPaginationChange,
  curIndex,
  onSyncByName,
  initEvent,
  isIngSearch,
} = useSearchContent();

watch(props.curTypeQuery, (new_v, old_v) => {
  let vodName = new_v["vodName"];
  if (vodName) {
    searchObject.value.vodName = vodName;
    initData(1, new_v);
  }
});
onMounted(() => {
  initData();
  initEvent();
});

onBeforeUnmount(() => {
  ipcRenderer.removeListener("sednMainWindowBySearchEvent", () => {});
});
</script>

<style lang="scss">
.content {
  padding: 25px;
  box-sizing: border-box;
  box-shadow: 0 0 0 0;
  background: #25252b;
  border-radius: 13px;

  .header {
    border-bottom: 4px solid #32323c;
    padding-bottom: 20px;

    display: flex;
    justify-content: center;
    span {
      margin-right: 30px;
      font-size: 20px;
      color: white;
      cursor: pointer;
      font-weight: bold;
      position: relative;
      &.active {
        color: #a8a8aa;
        &::before {
          content: "";
          display: block;
          position: absolute;
          height: 4px;
          width: 100%;
          background: #ff2a14;
          bottom: -24px;
        }
      }
    }
  }
  .center {
    margin-top: 20px;
    li {
      display: flex;
      border-bottom: 2px solid #32323c;
      padding-bottom: 15px;
      margin-bottom: 15px;

      .label {
        font-size: 16px;
        background: #32323c;
        padding: 8px 12px;
        text-align: center;
        border-radius: 8px;
        color: white;
        white-space: nowrap;
        height: 25px;
        margin-right: 20px;
      }
      .tag {
        display: flex;
        flex-wrap: wrap;
        span {
          font-size: 14px;
          color: white;
          margin: 6px 10px 4px 10px;
          cursor: pointer;
          &.active {
            color: orangered;
          }
        }
      }
    }
  }
  .body {
    margin-top: 20px;
    display: grid;
    grid-template-columns: repeat(6, 15%);
    column-gap: 20px;
    row-gap: 25px;
  }
  .sync {
    background: rgba($color: #000000, $alpha: 0.2);
    box-sizing: border-box;
    padding: 20px;
    cursor: pointer;
    font-size: 12px;
    color: white;
    line-height: 34px;
    font-weight: 700;
    box-shadow: 0px 1px 1px 2px #32323c;
  }
  .total {
    font-size: 18px;
    width: 100%;

    justify-content: center;
  }
}
.paginter {
  margin-top: 10px;
  .arco-pagination-total {
    color: white;
  }
}
</style>
