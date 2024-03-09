<template>
  <div class="swiperWrapper">
    <swiper
      :modules="modules"
      class="swiper"
      :loop="true"
      :slides-per-view="1"
      :pagination="{ clickable: true }"
      @swiper="onSwiper"
      @slideChange="onSlideChange"
      :autoplay="{ delay: 4000, pauseOnMouseEnter: true }"
    >
      <swiper-slide
        :virtualIndex="index"
        v-for="(item, index) in swipers"
        :key="index"
        class="swiper-slide"
        @click="onClickSwiperItem(item)"
      >
        <div v-if="historyMap[item['title']]" class="tag">
          您上次看到了 {{ historyMap[item["title"]]["number"] }}的
          {{ historyMap[item["title"]]["percent"] }} 继续观看不~
        </div>
        <img :src="onReplaceImgSrcFn(item['pic_lists'][0]['url'])" alt="" />
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { computed, defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import { getIndexHot } from "../request/spide/360kanSpide";
import userStore from "../store/history";
import "swiper/scss";
import "swiper/scss/navigation";
import "swiper/scss/pagination";
import "swiper/scss/scrollbar";
const router = useRouter();
const historyStore = userStore();
defineComponent({
  Swiper,
  SwiperSlide,
});

function useSwiper() {
  /**
   * onSwiper
   */
  const lists = ref([]);
  const historyMap = computed(() => {
    let historyObject = historyStore.$state.playHistory.reduce((reduce, item) => {
      reduce[item["vodName"]] = item;
      return reduce;
    }, {});
    return historyObject;
  });

  const swipers = computed(
    () =>
      lists.value &&
      lists.value.filter(
        (item, index) => index > 0 && item["pic_lists"] && item["pic_lists"].length
      )
  );

  const onSwiper = function () {};

  const onSlideChange = function () {};

  // 获取数据
  const initData = async function () {
    try {
      let results = await getIndexHot();
      lists.value = [...results];
    } catch (e) {}
  };
  // 点击了滑块
  const onClickSwiperItem = function (item) {
    const { title } = item;
    if (!title) return;
    if (!historyMap.value[title]) {
      router.push({
        name: "playSearch",
        query: {
          vodName: title,
        },
      });
    } else {
      const { curType, vodId, currentTime, playSouce } = historyMap.value[title];
      router.push({
        name: "play",
        query: {
          type: curType ? curType : 0,
          vodId: vodId,
          speek: currentTime,
          playSouce: playSouce,
        },
      });
    }
  };

  // 替换元素
  const onReplaceImgSrcFn = function (src) {
    return src.indexOf("p2.ssl.qhimg.com") != -1
      ? src.replace("p2.ssl.qhimg.com", "p1.ssl.qhimg.com")
      : src;
  };
  return {
    onSwiper,
    onSlideChange,
    initData,
    swipers,
    historyMap,
    onClickSwiperItem,
    onReplaceImgSrcFn,

    modules: [Navigation, Pagination, Autoplay],
  };
}
const {
  onSwiper,
  onSlideChange,
  modules,
  initData,
  lists,
  swipers,
  onClickSwiperItem,
  historyMap,
  onReplaceImgSrcFn,
} = useSwiper();
onMounted(() => {
  initData();
});
</script>

<style lang="scss" scoped>
.swiperWrapper {
  width: 100%;
  .swiper {
    .swiper-slide {
      height: 340px;
      cursor: pointer;
      position: relative;
      .tag {
        font-weight: bold;
        position: absolute;
        cursor: pointer;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 99999;
        color: orangered;
        font-size: 14px;
        box-sizing: border-box;
        padding: 12px;
        letter-spacing: 1.6px;
      }
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
