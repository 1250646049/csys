import { defineStore } from 'pinia'

export default defineStore('history', {
  state() {
    return {
      // 影视播放历史
      playHistory: [],
      // 小说历史|书架|阅读历史
      readHistory: []
    }
  },
  getters: {},
  actions: {
    // 加入播放历史|影视
    insertPlayHistory(result) {
      const { vodId, vodName } = result
      let index = this.playHistory.findIndex(
        (item) => item['vodId'] == vodId && item['vodName'] == vodName
      )
      //   如果找不到
      if (index == -1) {
        this.playHistory.unshift(result)
      } else {
        this.playHistory.splice(index, 1, result)
        // this.playHistory.unshift(result)
      }
    },
    // 获取历史数据|影视
    getHistorys() {
      let data = [...this.playHistory]
      return data
    },

    // 清空数据|影视
    clearHistory() {
      this.playHistory = []
    },
    // 加入阅读历史
    addReadHistory(item) {
      var { author = '', readType = '', bookTitle = '', type = '' } = item
      if ((author.indexOf('作者:') != -1) || author.indexOf('作者：') != -1) {
        author = author.replace('作者:', '').replace("作者：",'')
      }
      item['author'] = author
      item['readId'] = type + '_' + author + '_' + readType + '_' + bookTitle
      // 查询是否已经被阅读过了
      let index = this.readHistory.findIndex(
        (read) =>
          type == read['type'] &&
          author == read['author'] &&
          readType == read['readType'] &&
          bookTitle == read['bookTitle']
      )
      if ('history' == type) {
        if (index == -1) {
          this.readHistory.unshift(item)
        } else {
          this.readHistory.splice(index, 1, item)
        }
      } else {
        if (index == -1) {
          this.readHistory.unshift(item)
        } else {
          return false
        }
      }

      return true
    },
    // 根据类型清空数据
    cleanReadList(type) {
      if (!type) return
      let filetList = this.readHistory.filter((item) => item['type'] !== type)
      this.readHistory = [...filetList]
    },
    // 根据id删除
    deleteReadListById(id) {
      let index = this.readHistory.findIndex((item) => item['readId'] == id)
      if (index != -1) {
        this.readHistory.splice(index, 1)
      }
    },
    // 根据id拼接返回阅读详情
    selectReadListById(item) {
      var { author = '', readType = '', bookTitle = '' } = item
      if (author.indexOf('作者:') != -1 || author.indexOf('作者：') != -1) {
        author = author.replace('作者:', '').replace('作者：', '')
      }
      let readId = author + '_' + readType + '_' + bookTitle
      let findList = this.readHistory.filter((items) => {
        let curReadId = items['author'] + '_' + items['readType'] + '_' + items['bookTitle']
        return curReadId == readId
      })
      return findList
    }
  },
  persist: true
})
