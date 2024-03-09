const request = require('request')
import { sendSpiderEvent, sednMainWindowBySearchEvent } from '../../utils/sendMessage'
import { batchInsertListData, comparListRetrun } from './commonOpera'

// 公共请求接口配置

const baseRequestApis = {
  zyku: {
    lists: 'https://api.1080zyku.com/inc/api_mac10.php?ac=list&pg=',
    lines: 'https://api.1080zyku.com/inc/api_mac10.php?ac=detail&ids='
  }
}

// 采集列表页
export const reqZykuList = function (pg = 1, h = null, vodName = null) {
  request.get(
    baseRequestApis.zyku.lists +
      pg +
      (h ? '&h=' + h : '') +
      (vodName ? `&wd=${encodeURIComponent(vodName)}` : ''),
    {},
    async (err, rep, body) => {
      if (!err) {
        const data = JSON.parse(body)
        /**
         * 获取详情页内容并且加入数据库
         */
        if (!data || !data['list'] || data['list'].length == 0) {
          if (vodName) {
            sednMainWindowBySearchEvent('')
          }
          return
        }
        let finalData = await reqzYKuDetail(data)
        await batchInsertListData(finalData, 'zyku')

        sendSpiderEvent(data)
        // todo
        if (!vodName) {
          window.setTimeout(() => {
            try {
              reqZykuList(pg + 1, h)
            } catch (e) {}
          }, 1000)
        } else {
          sednMainWindowBySearchEvent('')
        }
      } else {
        console.log('采集失败' + err)
      }
    }
  )
}

// 采集详情页内容

const reqzYKuDetail = function (result) {
  const { list } = result
  if (!list) return
  let ids = list.map((item) => item['vod_id']).toString()
  return new Promise((reslove, reject) => {
    request.get(baseRequestApis.zyku.lines + ids, (err, resp, body) => {
      if (err) {
        reject(err)
      } else {
        let data = JSON.parse(body)
        let lines = data['list']
        let results = comparListRetrun(list, lines)
        // batchInsertListData(insertMoviceListData, data, moviceListFields)
        reslove(results)
      }
    })
  })
}
