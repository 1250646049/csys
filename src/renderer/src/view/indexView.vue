<template>
  <div class="index">
    <!-- 头部 -->
    <HeaderCom @onMenuClick="onMenuClick" />
    <!-- 热门 -->
    <CurrentHot />

    <!-- 首页推荐 -->
    <IndexStar />
    <!-- 导航栏 -->
    <IndexRouter />

    <!-- 工具栏目 -->
    <div class="utils">
      <a-drawer
        :width="400"
        :visible="visible"
        placement="right"
        @ok="onSaveSetting"
        @cancel="visible = false"
        unmountOnClose
      >
        <template #title> 系统设置 </template>
        <div>
          <SettingComp ref="settCom" />
        </div>
      </a-drawer>
    </div>
  </div>
</template>

<script setup>
import { defineComponent, ref, getCurrentInstance, onMounted } from "vue";
import { useRouter } from "vue-router";
import HeaderCom from "../components/HeaderCom.vue";

import CurrentHot from "../components/CurrentHot.vue";
import IndexRouter from "../components/IndexRouter.vue";
import IndexStar from "../components/IndexStar.vue";
import SettingComp from "../components/SettingComp.vue";

const { $mitt } = getCurrentInstance().appContext.config.globalProperties;
import { Notification } from "@arco-design/web-vue";
import useStore from "../store/history";
const store = useStore();
const router = useRouter();
defineComponent({
  HeaderCom,
  CurrentHot,
  IndexRouter,
  IndexStar,
  SettingComp,
});
const settCom = ref(null);
function useIndexView() {
  const visible = ref(false);

  // 监听头事件点击
  const onMenuClick = function (type) {
    switch (type) {
      case "setting": {
        // 打开设置抽屉
        visible.value = !visible.value;
        break;
      }
      case "db": {
        // todo
        break;
      }
      case "req": {
        // todo
        break;
      }
    }
  };

  // 应用设置
  function onSaveSetting() {
    visible.value = false;
    // 保存完设置刷新生效!
    $mitt.emit("saveSetting");
    // window.location.reload();
  }
  // 初始化历史记录弹窗
  function inithistory() {
    let playHistory = store.$state.playHistory;
    if (playHistory && playHistory.length > 0) {
      let isShow = window.sessionStorage.getItem("isShow");
      if (isShow) return;
      window.sessionStorage.setItem("isShow", true);
      let arcoOverlay = null;
      let {
        vodName,
        number,
        percent,
        curType,
        vodId,
        currentTime,
        playSouce,
      } = playHistory[0];
      const notification = Notification.warning({
        title: vodName,
        content: `您上次看到了  ${number} 的 ${percent} 是否继续观看?`,
        closable: true,
        duration: 10000,
        position: "bottomLeft",
        footer: "继续观看",
        onClose: () => {
          if (arcoOverlay) {
            arcoOverlay.removeEventListener("click", () => {});
          }
        },
      });
      arcoOverlay = document.querySelector(".arco-overlay");
      arcoOverlay &&
        arcoOverlay.addEventListener("click", () => {
          // 跳转视频播放
          router.push({
            name: "play",
            query: {
              type: curType ? curType : 0,
              vodId: vodId,
              speek: currentTime,
              playSouce: playSouce,
            },
          });
          notification.close();
        });
    }
  }
  return {
    onMenuClick,
    visible,
    onSaveSetting,
    inithistory,
  };
}

const { onMenuClick, visible, onSaveSetting, inithistory } = useIndexView();
onMounted(() => {
  inithistory();
  window.LOG("软件启动~");
});
</script>

<style lang="scss" scoped>
.index {
  padding-bottom: 40px;
  background: #2e2e36;
}
</style>
