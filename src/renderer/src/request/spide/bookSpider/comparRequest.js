const { ipcRenderer } = require('electron')
import { findIndexBookList, findDetailData, getContentByUrl, searchContent } from './xdizhuSpider'
import { parseSearchLists, parseDetailContent as ixParseDetailContent ,
  parseReadContent
} from './ixpsgeSpider'
import { searchConst } from './bookConstan'
import {
  searchContent as wySearchContent,
  parseDetailContent,
  parseDetailReadContent
} from './wytxteamSpider'
// 整合请求
//todo 查询列表页
export const startSpider = async function (pgData) {
  let lists = await findIndexBookList(pgData)
  ipcRenderer.invoke('BookSpiderData', JSON.stringify(lists))
}
// todo 查询详情页
export const startSpiderDetail = async function (data = {}) {
  const { type } = data
  let result = {}
  try {
    switch (type) {
      case 'xdizhu': {
        result = await findDetailData(data['url'])
        break
      }
      // 花生阅读
      case 'wytxteam': {
        result = await parseDetailContent(data['url'])
        break
      }
      case 'ixpsge': {
        result = await ixParseDetailContent(data['url'])
        break
      }
    }
  } catch (e) {}

  ipcRenderer.invoke('BookSpiderDetail', JSON.stringify(result))
}
// 开始阅读数据
export const startReadBookContent = async function (data = {}) {
  let result = {}
  const { type } = data
  try {
    switch (type) {
      case 'xdizhu': {
        result = await getContentByUrl(data)
        break
      }
      // 花生阅读
      case 'wytxteam': {
        result = await parseDetailReadContent(data['url'])
        break
      }
      case "ixpsge":{
        result=await parseReadContent(data['url'])
        break
      }
    }
  } catch (e) {}

  ipcRenderer.invoke('startReadBookContent', JSON.stringify(result))
}

// 搜索图书内容
export const startSearchContent = async function (data = {}) {
  let result = []
  const { type = '' } = data
  try {
    let value = searchConst[type] ? searchConst[type] : ''

    switch (value) {
      case 'wytxteam': {
        // 花生书源
        result = await wySearchContent(data)
        break
      }
      case 'ixpsge': {
        result = await parseSearchLists(data)
        break
      }
      default: {
        // 花生书源
        result = await searchContent(data)
        break
      }
    }
  } catch (e) {}
  ipcRenderer.invoke('startSearchContent', JSON.stringify(result))
}
