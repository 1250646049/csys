<template>
  <div class="wrap">
    <div class="title">
      <h2>{{ title }}</h2>
      <div class="alert">
        <span
          @click="onAlertPosition(0)"
          class="iconfont icon-xiangzuojiantou"
          :class="currentIndex == 1 ? '' : 'active'"
        ></span>
        <span
          @click="onAlertPosition(1)"
          class="iconfont icon-xiangyoujiantou"
          :class="currentIndex == maxPage ? '' : 'active'"
        ></span>
      </div>
    </div>
    <div class="body">
      <slot name="body"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";
const props = defineProps({
  title: {
    require: true,
    type: String,
  },
  maxPage: {
    require: false,
    default: 2,
    type: Number,
  },
});
const emit = defineEmits(["onAlertPosition"]);
function useCurrentHot() {
  const currentIndex = ref(1);
  /**
   *
   * @param {改变点位} index
   */
  const onAlertPosition = function (pos) {
    // 减少
    let flag = false;
    if (pos == 0) {
      if (currentIndex.value > 1) {
        currentIndex.value -= 1;
        flag = true;
      }
    } else {
      if (currentIndex.value < props.maxPage) {
        currentIndex.value += 1;
        flag = true;
      }
    }

    flag && emit("onAlertPosition", currentIndex.value);
  };

  return {
    onAlertPosition,
    currentIndex,
  };
}

const { onAlertPosition, currentIndex } = useCurrentHot();
</script>

<style lang="scss" scoped>
.wrap {
  // padding: 20px;
  box-sizing: border-box;
  background: rgb(46, 46, 54);
  padding: 20px;
  overflow: hidden;

  .title {
    display: flex;
    justify-content: space-between;
    h2 {
      font-size: 20px;
      color: white;
    }
    .alert {
      span {
        font-size: 20px;
        cursor: pointer;
        margin-right: 10px;
        &.active {
          color: white;
        }
      }
    }
  }
}
</style>
