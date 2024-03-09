const request = require('request')
import { batchInsertListData, comparListRetrun } from './commonOpera'
import { sendSpiderEvent, sednMainWindowBySearchEvent } from '../../utils/sendMessage'
const baseRequestApis = {
  tiankon: {
    lists: 'https://api.tiankongapi.com/api.php/provide/vod/from/tkm3u8/?ac=list&pg=',
    lines: 'https://api.tiankongapi.com/api.php/provide/vod//from/tkm3u8/?ac=detail&ids='
  }
}

// 采集列表页
export const spider2TianKonLists = function (pg = 1, h = null, vodName = null) {
  return new Promise((reslove, reject) => {
    request.get(
      baseRequestApis.tiankon.lists +
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
            batchInsertListData(lists,"天空")
            // reslove(result)
            sendSpiderEvent(result)
            if (!vodName) {
              window.setTimeout(() => {
                try {
               
                  spider2TianKonLists(pg + 1, h)
                
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
    request.get(baseRequestApis.tiankon.lines + ids.toString(), {}, (err, resp, data) => {
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
