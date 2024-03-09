import db from '../db/sqlitDb'
import { insertMoviceDetailData, insertMoviceListData } from '../db/sqls'

//   整合头和内容文件返回
export const comparListRetrun = function (headers = [], lists = []) {
  if (!headers || !lists) return
  return headers.map((item) => {
    const { vod_id } = item
    let childs = lists.filter((child_item) => child_item['vod_id'] == vod_id)
    if (childs && childs.length) {
      item['vod_year'] = childs[0]['vod_year']
    } else {
      item['vod_year'] = -1
    }
    item['childs'] = childs
    return item
  })
}

// 非凡采集加入数据库
/**
 * 过滤规则 根据影片名称+影片年份作为唯一值
 * @param {} lists
 */

export async function batchInsertListData(lists = [], type = '非凡') {
  let vodNames = lists.map((item) => item['vod_name'])
  let years = lists.map((item) => item['vod_year'])
  let allInData = await selectInDataHeader(vodNames, years)
  if (!allInData || allInData.length == 0) {
    // 将所有数据加入数据库
    await startInsertHeaderDb(lists, type)
  } else {
    // 存在的数据加入h行| 否者都加入数据
    let newlists = []
    let newUpdateList = []
    for (const item of lists) {
      const { vod_name, vod_year } = item
      let findItem = allInData.find(
        (items) => vod_name == items['vodName'] && vod_year == items['vodYear']
      )
      // 需要新增
      if (!findItem) {
        newlists.push(item)
      } else {
        // 需要更新行内容
        let childs = item['childs']
        if (!childs && childs.length == 0) continue
        childs = childs.map((chid) => {
          chid['vod_id'] = findItem['vodId']
          return chid
        })
        newUpdateList.push(...childs)
      }
    }
    // 插入头和行
    if (newlists.length) {
      await startInsertHeaderDb(newlists, type)
    }
    // 插入行数据
    if (newUpdateList.length) {
      await startInsertChildDb(newUpdateList, type)
    }
  }
}

// 根据年份和名称查询已经入库的头信息
function selectInDataHeader(vodNames = [], years = []) {
  let yearArr = years.map((item) => "'" + item + "'")
  let nameArr = vodNames.map((item) => "'" + item + "'")
  if (vodNames.length == 0 || years.length == 0) return null
  return new Promise((reslove, reject) => {
    db.all(
      `SELECT vod_id vodId,vod_name vodName,vod_year vodYear  FROM movice_list 
      WHERE vod_name IN ( ${nameArr.toString()} )
      AND vod_year IN ( ${yearArr.toString()}  )
      GROUP BY vod_name,vod_year
      `,
      (err, data) => {
        if (err) {
          reject(err)
        } else {
          reslove(data)
        }
      }
    )
  })
}

// 开始插入数据

const startInsertHeaderDb = function (lists = [], type = 'feifan') {
  // 开始加工下数据 预备加入数据库
  lists = lists.map((item) => {
    item['vod_id'] = type + '_' + item['vod_id']
    let childs = item['childs']
    if (childs && childs.length) {
      item['data'] = { ...childs[0] }
      item['childs'] = childs.map((items) => {
        items['vod_id'] = item['vod_id']
        return items
      })
    }
    return item
  })
  // 子元素 todo
  let childs = lists.reduce((reduce, item, index) => {
    let child = item['childs']
    if (child && child.length) {
      reduce.push(...child)
    }
    return reduce
  }, [])
  let valueSql = lists.reduce((reduce, item) => {
    const { data, vod_id, vod_name, vod_en, type_id, type_name } = item
    let sql = ''
    if (data) {
      const {
        vod_sub,
        vod_time,
        vod_letter,
        vod_color,
        vod_pic,
        vod_lang,
        vod_area,
        vod_year,
        vod_remarks,
        vod_actor,
        vod_director,
        vod_play_from,
        vod_content,
        vod_score,
        vod_hits,
        vod_play_note,
        vod_tag
      } = data
      sql +=
        "('" +
        vod_id +
        "'," +
        splitOtherStr(vod_name) +
        ',' +
        splitOtherStr(vod_en) +
        ',' +
        splitOtherStr(vod_sub) +
        ",'" +
        vod_time +
        "','" +
        vod_letter +
        "'," +
        splitOtherStr(vod_color) +
        ",'" +
        type_id +
        "','" +
        type_name +
        "'," +
        splitOtherStr(vod_pic) +
        ',' +
        splitOtherStr(vod_lang) +
        ',' +
        splitOtherStr(vod_area) +
        ",'" +
        vod_year +
        "'," +
        splitOtherStr(vod_remarks) +
        ',' +
        splitOtherStr(vod_actor) +
        ',' +
        splitOtherStr(vod_director) +
        ',' +
        splitOtherStr(vod_play_from) +
        ',' +
        splitOtherStr(vod_content) +
        ",'" +
        vod_score +
        "'," +
        splitOtherStr(vod_hits) +
        ',' +
        splitOtherStr(vod_sub) +
        ',' +
        splitOtherStr(vod_play_note) +
        ',' +
        splitOtherStr(vod_tag) +
        '),'
    }
    reduce += sql
    return reduce
  }, '')
  valueSql = valueSql.substring(0, valueSql.length - 1)
  return new Promise((reslove, reject) => {
    db.exec(
      `
       ${insertMoviceListData} ${valueSql}
      `,
      async (err, data) => {
        if (err) {
          reject(err)
        } else {
          await startInsertChildDb(childs, type)
          reslove(true)
        }
      }
    )
  })
}

// 开始处理子播放列表

const startInsertChildDb = async function (lists = [], type = '非凡') {
  // 先删除vod_id and 这类型的播放器
  try {
    await deleteLinesByPlaySource(lists, type)
  } catch (e) {
    console.log(e)
    return
  }
  let valueSql = lists.reduce((reduce, item) => {
    const { vod_id, vod_play_url, vod_time } = item
    reduce +=
      "('" +
      vod_id +
      "'," +
      splitOtherStr(vod_play_url) 
      +',' +
      splitOtherStr(type) +
      ',' +
      splitOtherStr(vod_time) +
      '),'
    return reduce
  }, '')
  valueSql = valueSql.substring(0, valueSql.length - 1)

  return new Promise((reslove, reject) => {
    db.exec(
      `
      ${insertMoviceDetailData} ${valueSql}
      `,
      (err, data) => {
        if (err) {
          reject(err)
        } else {
          reslove(data)
        }
      }
    )
  })
}

// 根据视频id|播放源删除数据

const deleteLinesByPlaySource = function (list = [], type = '非凡') {
  let vodIdsSql = list.map((item) => "'" + item['vod_id'] + "'").toString()
  return new Promise((reslove, reject) => {
    db.exec(
      `DELETE FROM movice_detail WHERE vod_id IN ( ${vodIdsSql} ) AND vod_play_from = '${type}' `,
      (err, data) => {
        if (err) {
          reject(err)
        } else {
          reslove(data)
        }
      }
    )
  })
}

// 单独处理字符串
function splitOtherStr(value) {

  return value ? "'" + new String(value).replaceAll("'", '"') + "'" : null
}
