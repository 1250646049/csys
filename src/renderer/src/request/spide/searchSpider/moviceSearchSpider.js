const request = require('request')
const cheerio = require('cheerio')
const {ipcRenderer}=require("electron")
// const HOST="106.15.93.67";
const HOST="localhost";
const URLS = {
  name: '淮源影视',
  url: 'http://'+HOST+':9001/',
  host: 'http://'+HOST+':9001/api/movice/list/findPagination?pageIndex={pageIndex}&pageRows={pageRows}&vodName={vodName}',
  host2:
    'http://'+ HOST +':9001/api/movice/detail/findPagination?pageIndex={pageIndex}&pageRows={pageRows}&moviceListId={moviceListId}'
}

export const startMoviceSearch = async function (data = {}) {
  const { playType, pageIndex, pageRows, content, moviceListId } = data
  let result = {}
  if (playType == 'header' || !playType) {
    result = await searchContentByList(content, pageIndex, pageRows)
  } else if (playType == 'line') {
    result = await searchLinDetailList(moviceListId, pageIndex, pageRows)
  }

  // 发送消息给主窗口
  ipcRenderer.invoke('startYunpanSearchListener', JSON.stringify(result))
}

//   搜索影片名称

const searchContentByList = (vodName = '', pageIndex = 1, pageRows = 20) => {
  if (!vodName) return
  let url = URLS.host
    .replace('{pageIndex}', pageIndex)
    .replace('{pageRows}', pageRows)
    .replace('{vodName}', encodeURIComponent(vodName))
  return new Promise((reslove, reject) => {
    request.get(url, {}, (err, resp, data) => {
      if (err) {
        reject(err)
      } else {
        let result=JSON.parse(data)
        result['type']="movice"
        reslove(result)
      }
    })
  })
}

// 根据影片id获取行列表

const searchLinDetailList = (moviceListId = null, pageIndex = 1, pageRows = 10) => {
  if (!moviceListId) return
  let url = URLS.host2
    .replace('{pageIndex}', pageIndex)
    .replace('{pageRows}', pageRows)
    .replace('{moviceListId}', moviceListId)

  return new Promise((reslove, reject) => {
    request.get(url, {}, (err, resp, data) => {
      if (err) {
        reject(err)
      } else {
        let result=JSON.parse(data)
        result['type']='moviceLines'
        reslove(result)
      }
    })
  })
}
