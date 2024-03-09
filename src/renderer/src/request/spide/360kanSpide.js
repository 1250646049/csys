const request = require('request')
import { sendSpiderBy360Event } from '../../utils/sendMessage'
import useStroe from '../../store/setting'
const store = useStroe()
// %E6%9E%81%E9%99%90%E6%8C%91%E6%88%98&
const requesturi = {
  header:
    'https://api.so.360kan.com/index?force_v=1&kw={content}&from=&pageno=1&v_ap=1&tab=all&cb=',
  line: 'https://api.so.360kan.com/episodeszongyi?site={site}&y={year}&entid={id}&offset={offset}&count={count}&v_ap=1&cb=',
  donmanUrl: 'https://api.so.360kan.com/episodesv2?v_ap=1&s={content}&cb=',
  detailUrl:
    'https://api.web.360kan.com/v1/detail?cat={cat}&id={id}&year={year}&site={site}&callback=',
  lunboUrls: 'https://api.web.360kan.com/v1/block?blockid=522&callback='
}

const baseHeaders = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
}

// 开始搜索

export const startSearchData = async (content = '') => {
  try {
    let number = store.$state.netWorkShowNumber
    if (number == -1) {
      number = null
    }
    let result = await searchContentByVodName(content, number)
    //   这里发送消息给子窗口
    sendSpiderBy360Event(result)
  } catch (e) {
    console.log(e)
  }

  //   console.log(result)
}

// 搜索内容

const searchContentByVodName = (content = '', number = null) => {
  content = encodeURIComponent(content)
  return new Promise((reslove, reject) => {
    request.get(
      requesturi.header.replace('{content}', content),
      baseHeaders,
      async (err, resp, data) => {
        if (err) {
          reject(err)
        } else {
          try {
            // 获取到头内容
            let result = JSON.parse(data)['data']['longData']
            var { rows } = result
            if (!rows || rows.length == 0) {
              reslove([])
              return
            }
            let retArray = []
            if (number) {
              rows = rows.slice(0, number)
            }
            for (const item of rows) {
              let value = await searchContentJxLines(item)

              retArray.push(value)
            }
            reslove(retArray)
          } catch (e) {
            reject(e)
          }

          // reslove(rows)
        }
      }
    )
  })
}

// 整合返回参数
const searchContentJxLines = async function (item) {
  const { playlinks, id, cat_name } = item
  let playKeys = Object.keys(playlinks)
  let movice = {
    vodId: id,
    vodName: item['titleTxt'],
    vodEnname: item['c'],
    vodSubname: item['url'],
    vodTime: new Date(),
    vodLetter: '',
    vodColor: '',
    typeId: item['cat_id'],
    typeName: item['cat_name'],
    vodPic: item['cover'],
    vodLang: '',
    vodArea: item['area'] ? item['area'].toString() : '',
    vodYear: item['year'],
    vodRemarks: item['coverInfo'] && item['coverInfo']['txt'] ? item['coverInfo']['txt'] : '',
    vodActor: item['actList'] ? item['actList'].toString() : '',
    vodDirector: item['dirList'] ? item['dirList'].toString() : '',
    vodPlayFrom: playKeys ? playKeys.toString() : '',
    vodContent: item['description'],
    vodScore: item['score'],
    vodHits: '',
    vodSub: item['title'],
    vodPlayNote: '',
    vodTag: item['tag'] ? item['tag'].toString() : '',
    playList: [],
    coverInfo: item['coverInfo'],
    en_id: item['en_id']
  }

  try {
    let retArray = []
    if (cat_name == '综艺') {
      let retObject = await parseZyPlayLists(item)
      retArray = retObject['retArray']
      movice['years'] = retObject['year']
    } else if (cat_name == '电影') {
      retArray = parseMovicePlayLists(item)
    } else {
      retArray = await parseTvPlayLists(item)
    }
    movice['playList'] = retArray
  } catch (e) {
    console.log(e)
  }

  return movice
}

// 解析电影内容
const parseMovicePlayLists = function (item) {
  const { playlinks } = item
  let playKeys = Object.keys(playlinks)
  let retArray = []
  for (const d of playKeys) {
    if (!d || !playlinks[d]) continue
    retArray.push({
      vod_play_from: d,
      vod_play_list: typeof playlinks[d] == 'string' ? [playlinks[d]] : playlinks[d]
    })
  }
  return retArray
}

// 解析其他片内容|电视剧
const parseTvPlayLists = async function (item) {
  var { playlinks, seriesPlaylinks = [], en_id, cat_name, cat_id } = item
  console.log(item['title'], item)
  const playKeys = Object.keys(playlinks)
  if (seriesPlaylinks && seriesPlaylinks.length > 0) {
    let key = playKeys[0]
    return [{ vod_play_from: key, vod_play_list: seriesPlaylinks }]
  }
  if (!playKeys || playKeys.length == 0) return
  let retArray = []
  for (const d of playKeys) {
    let playUrl = playlinks[d]
    // 如果是动漫，并且播放集数只有一条 则继续去请求动漫单独的播放地址
    let vodPlayList = typeof playUrl == 'string' ? [playUrl] : playUrl
    if (vodPlayList.length == 1) {
      try {
        vodPlayList = await searchPlayListByDonman(en_id, d, cat_id)
      } catch (e) {}
    }
    retArray.push({
      vod_play_from: d,
      vod_play_list: vodPlayList
    })
  }
  return retArray
}

// 解析综艺片内容
const parseZyPlayLists = async function (item) {
  const { playlinks, playlinks_total, playlinks_year, id } = item
  let playKeys = Object.keys(playlinks)
  let retArray = []
  let retObject = {}
  for (const d of playKeys) {
    if (!d) continue
    // 年份
    let year = playlinks_year && playlinks_year[d] ? playlinks_year[d] : ''
    if (!year || year.length == 0) continue
    let curArray = []
    // 默认取第一个年份
    retObject['year'] = year
    year = year[0]
    // 默认内容
    curArray.push(...playlinks[d])

    //   总数
    let total = playlinks_total[d]
    if (curArray.length == total) {
      retArray.push({
        vod_play_from: d,
        vod_play_list: curArray
      })
      continue
    }
    try {
      let otherLines = await searchLinesByVodName(id, year, d)
      const { data } = otherLines
      let list = []
      if (data['list']) {
        list = data['list']
      } else {
        list = data
      }
      curArray.push(...list)
      retArray.push({
        vod_play_from: d,
        vod_play_list: curArray
      })
    } catch (e) {
      console.log(e)
    }
  }
  retObject['retArray'] = retArray
  return retObject
}
// 请求行内容
export const searchLinesByVodName = (id = -1, year = 0, site = '', offset = 5) => {
  let uri = requesturi.line
    .replace('{site}', site)
    .replace('{id}', id)
    .replace('{year}', year)
    .replace('{offset}', offset)
    .replace('{count}', -1)

  return new Promise((reslove, reject) => {
    request.get(uri, baseHeaders, (err, resp, data) => {
      if (err) {
        reject(err)
      } else {
        let result = JSON.parse(data)
        reslove(result)
      }
    })
  })
}

// 单独请求动漫的播放地址
const searchPlayListByDonman = (en_id = '', site = '', cat_id = '2') => {
  // let s = [{ cat_id: '"' + cat_id + '"', ent_id: en_id, site: site }]
  let ends = `%5B%7B"cat_id"%3A"${cat_id}"%2C"ent_id"%3A"${en_id}"%2C"site"%3A"${site}"%7D%5D&`
  return new Promise((reslove, reject) => {
    request.get(requesturi.donmanUrl.replace('{content}', ends), baseHeaders, (err, resp, data) => {
      if (err) {
        reject(err)
      } else {
        let result = JSON.parse(data)['data']
        if (!result || result.length == 0) {
          return reslove([])
        }
        let seriesPlaylinks = result[0]['seriesHTML']['seriesPlaylinks']
        reslove(seriesPlaylinks)
      }
    })
  })
}

// 解析详情页地址
export const parse360KanDetailAddress = (cat = 2, id, year, site) => {
  return new Promise((reslove, reject) => {
    request.get(
      requesturi.detailUrl
        .replace('{cat}', cat)
        .replace('{id}', id)
        .replace('{year}', year ? year : '')
        .replace('{site}', site == 'bilibili1' ? '' : site),
      {
        headers: {
          ...baseHeaders,
          Referer: 'https://www.360kan.com/tv/PLRpan7mSzbuNn.html'
        }
      },
      (err, resp, data) => {
        if (err) {
          reject(err)
        } else {
          let result = JSON.parse(data)
          console.log(result)
          reslove(result)
        }
      }
    )
  })
}

// 获取首页推荐
export const getIndexHot = () => {
  return new Promise((reslove, reject) => {
    request.get(
      requesturi.lunboUrls,
      {
        headers: {
          ...baseHeaders,
          Referer: 'https://www.360kan.com/tv/PLRpan7mSzbuNn.html'
        }
      },
      (err, rep, data) => {
        if (err) {
          reject(err)
        } else {
          let results = JSON.parse(data)['data']
          reslove(results['lists'])
        }
      }
    )
  })
}
