<template>
  <div class="LeftMenu">
    <!-- 内容区域 -->
    <slot name="content"></slot>
    <!-- 菜单显示 -->
    <div
      v-show="menus.show"
      :style="{ left: menus.left + 'px', top: menus.top + 'px' }"
      class="menu"
    >
      <ul>
        <li @click.prevent="onMenuClick(0)"><icon-refresh /><span>刷新页面</span></li>
        <li class="line"></li>
        <li><icon-empty /><span>检测更新</span></li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import { IconRefresh, IconEmpty } from "@arco-design/web-vue/es/icon";
function initLeftMenu() {
  const menus = ref({
    top: 0,
    left: 0,
    show: false,
  });
  const initMitt = function () {
    // 监听右键菜单
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      let x = e.clientX;
      let y = e.clientY;
      menus.value.left = x;
      menus.value.top = y;
      menus.value.show = true;
    });

    document.addEventListener("click", (e) => {
      e.preventDefault();
      if (menus.value.show) {
        menus.value.show = false;
      }
    });
  };

  const removeLeftMenu = function () {
    document.removeEventListener("contextmenu", () => {});
    document.removeEventListener("click", () => {});
  };

  const onMenuClick = function (type) {
    switch (type) {
      // 刷新系统
      case 0: {
        window.freshWindows();
        break;
      }
    }
  };
  return {
    initMitt,
    removeLeftMenu,
    menus,
    onMenuClick,
  };
}

const { initMitt, removeLeftMenu, menus, onMenuClick } = initLeftMenu();

onMounted(() => {
  initMitt();
});

onBeforeUnmount(() => {
  removeLeftMenu();
});
</script>

<style lang="scss" scoped>
.LeftMenu {
  height: 100%;
  .menu {
    position: fixed;
    // width: 80px;
    box-sizing: border-box;
    padding: 10px 14px;
    background: white;
    z-index: 9999;
    transition: all 0.3s linear;

    ul {
      li {
        text-align: center;
        box-sizing: border-box;
        padding: 4px 0;
        font-size: 14px;
        cursor: pointer;
        white-space: nowrap;
        span {
          margin-left: 4px;
        }
        &.line {
          height: 1px;
          width: 100%;
          background: #eee;
          padding: 0;
          margin: 4px 0;
        }
      }
    }
  }
}
</style>
