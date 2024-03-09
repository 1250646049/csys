import db from './sqlitDb'
import { insertMoviceDetailData, insertMoviceListData } from './sqls'
// 查询selectOne

export const selectOne = function (sql) {
  if (!sql) return
  return new Promise((reslove, reject) => {
    db.all(sql, (err, data) => {
      if (err) {
        reject(err)
      } else {
        reslove(data[0])
      }
    })
  })
}

//批量视频列表插入数据
export const batchInsertListData = function (sql, data, rows) {
  if (!data || !rows || !data['list']) return
  var { list } = data
  let fianSql = ` `
  for (const item of list) {
    let values = toSqlInsetValues([item], rows)
    fianSql += sql + values + ';'
  }
  return new Promise((reslove, reject) => {
    db.exec(fianSql, (err) => {
      if (err) {
        reject({ code: 0, msg: err })
      } else {
        // 插入详情页
        batchInserDetail(insertMoviceDetailData, data)
        reslove({ code: 1, msg: '成功' })
      }
    })
  })
}

//批量视频播放页插入数据
export const batchInserDetail = function (sql, data) {
  if (!data || !data['list']) return
  var { list } = data
  let finalSQL = ''
  for (const item of list) {
    let values = toSqlInsetValues([item], ['vod_id', 'vod_play_url', 'vod_play_from', 'vod_time'])
    finalSQL += sql + values + ';'
  }
  return new Promise((reslove, reject) => {
    db.exec(finalSQL, (err) => {
      if (err) {
        console.log(sql + values)
        reject({ code: 0, msg: err })
      } else {
        reslove({ code: 1, msg: '成功' })
      }
    })
  })
}

// 将字段转为插入sql
function toSqlInsetValues(list = [], rows) {
  let values = list.reduce((reduce, item) => {
    let str_sql = ' ('
    let upSql = ' SET '
    for (const it of rows) {
      let value = item[it]
      let sqlitValue = value ? "'" + value.replaceAll("'", '"') + "'" : 'null'
      str_sql += sqlitValue + ','
      upSql += ` ${it}=${sqlitValue} , `
    }
    str_sql =
      str_sql.substring(0, str_sql.length - 1) +
      ' )' +
      ` ON CONFLICT(vod_id) DO UPDATE  ` +
      upSql.substring(0, upSql.length - 1)
    reduce += str_sql + ','
    return reduce
  }, '')
  values = values.substring(0, values.length - 2)

  return values
}

// 生成唯一主键
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}


