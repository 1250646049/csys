<template>
  <div class="star">
    <!-- 电视剧 -->
    <IndexWrap :max-page="6" @on-alert-position="onAlertTeleplayPosition" title="电视剧">
      <template #body>
        <IndexStarItem :lists="teleptList" class="item" />
      </template>
    </IndexWrap>
    <!-- 电影 -->
    <IndexWrap :max-page="6" @on-alert-position="onAlertMovicePosition" title="电影">
      <template #body>
        <IndexStarItem :lists="moviceList" class="item" />
      </template>
    </IndexWrap>

    <!-- 综艺 -->
    <IndexWrap :max-page="6" @on-alert-position="onAlertVarietyPosition" title="综艺">
      <template #body>
        <IndexStarItem :lists="varietyList" class="item" />
      </template>
    </IndexWrap>

    <!-- 动漫 -->
    <IndexWrap :max-page="6" @on-alert-position="onAlertAnimationPosition" title="动漫">
      <template #body>
        <IndexStarItem :lists="animationList" class="item" />
      </template>
    </IndexWrap>
  </div>
</template>

<script setup>
import { defineComponent, reactive, onMounted } from "vue";
import IndexStarItem from "./IndexStarItem.vue";
import { selectIndexYSJPlay } from "../request/conformity";
import IndexWrap from "./IndexWrap.vue";

defineComponent({
  IndexWrap,
  IndexStarItem,
});

// 初始化数据
function useIndexStar() {
  // 电视剧
  const pageRows = 7;
  const moviceList = reactive([]);
  const teleptList = reactive([]);
  const varietyList = reactive([]);
  const animationList = reactive([]);
  // 初始化电影数据
  const initDataMovice = async (pageIndex = 1) => {
    let pastLists = [...moviceList];
    moviceList.splice(0, moviceList.length);
    try {
      let results = await selectIndexYSJPlay(pageIndex, pageRows, "电影");
      if (!results || results.length == 0) {
        moviceList.push(...pastLists);
        return;
      }
      moviceList.push(...results);
    } catch (e) {
      console.log(e);
    }
  };

  // 初始化电影数据
  const initDataTeleplay = async (pageIndex = 1) => {
    let pastLists = [...teleptList];
    teleptList.splice(0, teleptList.length);
    try {
      let results = await selectIndexYSJPlay(pageIndex, pageRows, "电视剧");
      if (!results || results.length == 0) {
        teleptList.push(...pastLists);
        return;
      }
      teleptList.push(...results);
    } catch (e) {
      console.log(e);
    }
  };

  // 初始化综艺数据
  const initDataVariet = async (pageIndex = 1) => {
    let pastLists = [...varietyList];
    varietyList.splice(0, varietyList.length);
    try {
      let results = await selectIndexYSJPlay(pageIndex, pageRows, "综艺");
      if (!results || results.length == 0) {
        varietyList.push(...pastLists);
        return;
      }
      varietyList.push(...results);
    } catch (e) {
      console.log(e);
    }
  };

  // 初始化综艺数据
  const initDataAnimation = async (pageIndex = 1) => {
    let pastLists = [...animationList];
    animationList.splice(0, animationList.length);
    try {
      let results = await selectIndexYSJPlay(pageIndex, pageRows, "动漫");
      if (!results || results.length == 0) {
        animationList.push(...pastLists);
        return;
      }
      animationList.push(...results);
    } catch (e) {
      console.log(e);
    }
  };
  // 电影切换下一页
  const onAlertMovicePosition = function (index) {
    initDataMovice(index);
  };

  const onAlertTeleplayPosition = function (index) {
    initDataTeleplay(index);
  };

  const onAlertVarietyPosition = function (index) {
    initDataVariet(index);
  };

  const onAlertAnimationPosition = function (index) {
    initDataAnimation(index);
  };
  // 初始化基础数据
  const initData = () => {
    initDataMovice();
    initDataTeleplay();
    initDataVariet();
    initDataAnimation();
  };

  return {
    initData,
    moviceList,
    onAlertMovicePosition,
    teleptList,
    onAlertTeleplayPosition,
    varietyList,
    onAlertVarietyPosition,
    animationList,
    onAlertAnimationPosition,
  };
}

const {
  initData,
  moviceList,
  onAlertMovicePosition,
  onAlertTeleplayPosition,
  teleptList,
  varietyList,
  onAlertVarietyPosition,
  animationList,
  onAlertAnimationPosition,
} = useIndexStar();
onMounted(() => {
  initData();
});
</script>

<style lang="scss" scoped></style>
