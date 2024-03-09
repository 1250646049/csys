import { defineStore } from 'pinia'

export default defineStore('search', {
  state() {
    return {
      // 云盘搜索内容
      yunpan: {
        selectObject: {},
        selectIndex: -1,
        searchObject: {
          content: '',
          page: 1
        },
        results: []
      },
      plugins:[
        {
          id:1,
          label:"资源搜索",
          type:"yunpan",
          select:true
        },
        {
          id:2,
          label:"影视检索",
          type:"movice",
          select:false
        },
      ]
    }
  },
  actions: {
    /**
     * 清空搜索资源
     */
    onClearData: function () {
      this.yunpan.selectObject = {}
      this.yunpan.selectIndex = -1
      this.yunpan.searchObject = {
        content: '',
        page: 1
      }
      this.yunpan.results = []
    }
  },
  getters: {},
  persist: true
})
