const request = require('request')
const cheerio = require('cheerio')
const { ipcRenderer } = require('electron')
const URLS = {
  upyunso: {
    name: '云盘搜',
    url: 'https://www.upyunso.com/',
    host2: 'https://api.upyunso2.com/search?keyword={keyword}&page={page}',
    host: 'https://upapi.juapp9.com/search?keyword={keyword}&page={page}',
    host3: 'https://api.upyunso1.com/search?keyword={keyword}&page={page}'
  }
}

export const startYunpanSearch = async function (data = {}) {
  let result = []
  try {
    let content = data['content']
    let page = data['page']
    result = await yunpanSearch(content, page)
  } catch (e) {
    console.log(e)
  } finally {
    console.log(result);
    // 发送消息给主窗口
    ipcRenderer.invoke('startYunpanSearchListener', JSON.stringify(result))
  }
}

// 云盘搜索
const yunpanSearch = function (content = '', page = 1) {
  if (!content) return
  let url = URLS['upyunso']['host2'].replace('{keyword}', encodeURIComponent(content)).replace('{page}', page)
  return new Promise((reslove, reject) => {
    request.get(url, {}, (err, resp, data) => {
      if (err) {
        reject(err)
      } else {
        try {
          let result = decodeURIComponent(escape(atob(data)))
          let finalResult = JSON.parse(result)
          finalResult['type']="yunpan"
          reslove(finalResult)
        } catch (e) {
          reject(err)
        }
      }
    })
  })
}
