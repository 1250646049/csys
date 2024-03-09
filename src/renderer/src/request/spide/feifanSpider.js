const request = require('request')
import { batchInsertListData, comparListRetrun } from './commonOpera'
import { sendSpiderEvent, sednMainWindowBySearchEvent } from '../../utils/sendMessage'
const baseRequestApis = {
  feifan: {
    lists: 'http://cj.ffzyapi.com/api.php/provide/vod/from/ffm3u8/?ac=list&pg=',
    lines: 'http://cj.ffzyapi.com/api.php/provide/vod/from/ffm3u8/?ac=detail&ids='
  }
}

// 采集列表页
export const spider2Lists = function (pg = 1, h = null, vodName = null) {
  return new Promise((reslove, reject) => {
    request.get(
      baseRequestApis.feifan.lists +
        pg +
        (h ? '&h=' + h : '') +
        (vodName ? `&wd=${encodeURIComponent(vodName)}` : ''),
      {},
      async (err, resp, data) => {
        if (err) {
          reject(err)
        } else {
          try {
            let result = JSON.parse(data)
            let lists = result['list']
            if (!result || !lists || lists.length == 0) {
              if (vodName) {
                sednMainWindowBySearchEvent('')
              }
              return
            }
            await spider2Details(lists)
            //   加入数据库
            batchInsertListData(lists)
            // reslove(result)
            sendSpiderEvent(result)
            if (!vodName) {
              window.setTimeout(() => {
                try {
               
                  spider2Lists(pg + 1, h)
                
                } catch (e) {}
              }, 1000)
            } else {
              sednMainWindowBySearchEvent('')
            }
          } catch (e) {
            console.log(e)
          }
          reslove(true)
        }
      }
    )
  })
}

// 根据列表页 采集播放页
const spider2Details = function (lists = []) {
  let ids = lists.map((item) => item['vod_id'])
  if (!ids) return
  return new Promise((reslove, reject) => {
    request.get(baseRequestApis.feifan.lines + ids.toString(), {}, (err, resp, data) => {
      if (err) {
        reject(err)
      } else {
        let result = JSON.parse(data)
        comparListRetrun(lists, result['list'])
        reslove(lists)
      }
    })
  })
}
