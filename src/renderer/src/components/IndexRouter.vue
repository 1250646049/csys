<template>
  <div class="router" :style="{ left: left + 'px' }">
    <a-menu
      mode="pop"
      theme="dark"
      showCollapseButton
      :collapsed="isCollapsed"
      @collapse="isCollapsed = !isCollapsed"
    >
      <a-menu-item
        @click="onMenuItemClick(item)"
        v-for="item in indexRouters"
        :key="item.id"
      >
        <template #icon>
          <span :class="item.icon"></span>
        </template>
        {{ item.label }}
      </a-menu-item>

    </a-menu>
  </div>
</template>

<script setup>
import { defineComponent, ref, defineProps } from "vue";
import { IconApps, IconBug, IconBulb } from "@arco-design/web-vue/es/icon";
import { indexRouters } from "../config/indexConstConfig";
import { useRouter } from "vue-router";
const router = useRouter();
defineComponent({
  IconApps,
  IconBug,
  IconBulb,
});
defineProps({
  left: {
    type: Number,
    default: 2,
  },
});
function useLeftMenu() {
  const isCollapsed = ref(true);
  const onMenuItemClick = function (item) {
    const { label, component } = item;
    if (!label || !component) return;
    router.push({
      name: component,
      query: {
        curType: label,
        bigType:label
      },
    });
  };
  return {
    isCollapsed,
    onMenuItemClick,
  };
}

const { isCollapsed, onMenuItemClick } = useLeftMenu();
</script>

<style lang="scss" scoped>
.router {
  position: fixed;

  top: 50%;
  transform: translateY(-50%);
  z-index: 9999;
}
</style>
