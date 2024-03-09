<template>
  <div v-if="showTable" class="Suspension">
    <div @click="onCloseTable" class="close">
      <icon-close />
    </div>
    <ul>
      <li @click="onToAddress(0)">
        <img src="../assets/icon/movice.png" alt="" />
        <span>影视</span>
      </li>
      <li @click="onToAddress(1)">
        <img src="../assets/icon/book.png" alt="" />
        <span>小说</span>
      </li>
      <li @click="onToAddress(2)">
        <img src="../assets/icon/yunpan.png" alt="" />
        <span>更多</span>
      </li>
    </ul>
  </div>

  <!-- 悬浮框 -->
  <div @click="onShowTable" v-else class="suspen_box">导航</div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, defineEmits, defineExpose } from 'vue'
import { IconClose } from '@arco-design/web-vue/es/icon'

const emits = defineEmits(['supensionChange'])
function useSuspension() {
  const showTable = ref(true)
  var eventTimer = null
  const initEvent = function () {
    window.addEventListener('scroll', (e) => {
      eventTimer && clearTimeout(eventTimer)
      eventTimer = setTimeout(() => {
        settTableShow()
      }, 200)
    })
  }
  const removeEvent = function () {
    window.removeEventListener('scroll', () => {})
  }

  const settTableShow = () => {
    let y = window.scrollY
    if (y >= 100) {
      showTable.value = false
    } else {
      showTable.value = true
    }
  }
  const onShowTable = function () {
    if (!showTable.value) {
      showTable.value = true
    }
  }
  const onCloseTable = function () {
    if (showTable.value) {
      showTable.value = false
    }
  }
  const onRestShowTable = function (flag) {
    showTable.value = flag
  }
  // 跳转指定地址
  const onToAddress = function (index) {
    emits('supensionChange', index)
  }
  return {
    initEvent,
    removeEvent,
    showTable,
    onShowTable,
    onCloseTable,
    onToAddress,
    onRestShowTable
  }
}

const {
  initEvent,
  removeEvent,
  showTable,
  onShowTable,
  onCloseTable,
  onToAddress,
  onRestShowTable
} = useSuspension()
onMounted(() => {
  initEvent()
})

onBeforeUnmount(() => {
  removeEvent()
})

defineExpose({
  onRestShowTable,
})
</script>

<style lang="scss" scoped>
.suspen_box {
  position: fixed;
  left: 10px;
  bottom: 10px;
  width: 50px;
  height: 50px;
  box-sizing: border-box;
  padding: 10px;
  border-radius: 50%;
  white-space: nowrap;
  z-index: 99999;
  background: rgba($color: #a9aeb8, $alpha: 0.7);
  font-weight: 600;
  text-align: center;
  font-size: 12px;
  color: white;
  line-height: 30px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}
.Suspension {
  position: fixed;
  bottom: 10px;
  background: linear-gradient(to right, #eff3f8, #ccd4ea, #eff2fa);
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  width: 400px;
  box-sizing: border-box;
  padding: 20px 15px;
  border-radius: 5px;
  box-shadow: 2px 2px 4px 2px #2e2e36;
  transition: all 0.3s;
  .close {
    font-size: 20px;
    color: #333;
    cursor: pointer;
    position: absolute;
    right: 10px;
    top: 1px;
  }
  ul {
    display: flex;
    justify-content: center;
    li {
      margin-right: 40px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      span {
        font-size: 14px;
        margin-top: 5px;
        &.active {
          color: orangered;
        }
      }
      img {
        width: 40px;
        height: 40px;
      }
    }
  }
}
</style>
