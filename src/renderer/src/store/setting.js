import { defineStore } from 'pinia'

export default defineStore('setting', {
  state: () => {
    return {
      mode: 'db',
      spiderTime: 7,
      netWorkShowNumber: 5,
      // 首页显示的组件序号
      mainComponentIndex:0,
      // 阅读设置
      readSetting:{
        // 翻页|上一页
        prevKey: 'ArrowLeft',
        // 翻页|下一页
        nextKey: 'ArrowRight',
        // 背景颜色
        bgcolor: '#faf0d9',
        // 字体颜色
        fontcolor: '#333',
        fontsize:16
      }
    }
  },

  getters: {},
  actions: {
    saveSetting(data = {}) {
      this.$state = { ...this.$state, ...data }
    }
  },
  persist: true
})
