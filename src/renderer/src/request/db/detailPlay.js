import db from './sqlitDb'
import { typeSearchList } from '../../config/indexConstConfig'
/**
 * 根据视频id查询数据
 */

export const selectMoviceById = function (voidId) {
  return new Promise((reslove, reject) => {
    db.all(
      `SELECT
    detail.vod_id vodId,
    detail.vod_play_from vodPlayFrom,
    lists.voD_name vodName,
    lists.vod_enname vodEnname,
    lists.type_name typeName,
    lists.vod_pic vodPic,
    lists.vod_lang vodLang,
    lists.vod_area vodArea,
    lists.vod_year vodYear,
    lists.vod_remarks vodRemarks,
    lists.vod_actor vodActor,
    lists.vod_director vodDirector,
    lists.vod_content vodContent,
    lists.vod_score vodScore,
    lists.vod_play_note vodPlayNote,
    lists.vod_tag vodTag,
    detail.vod_play_url vodPlayUrl
  FROM
    movice_detail detail
    LEFT JOIN movice_list lists ON ( detail.vod_id = lists.vod_id )
    WHERE detail.vod_id='${voidId}' ORDER BY detail.vod_play_from asc `,
      (err, data) => {
        if (err) {
          reject(err)
        } else {
          let playDetail = {}
          if (data && data.length > 0) {
            playDetail = { ...data[0], vodPlayUrl: '' }
            let urls = data.reduce((reduce, item) => {
              var { vodPlayFrom, vodPlayUrl } = item
              vodPlayFrom = vodPlayFrom ? vodPlayFrom : '未知播放源'
              if (vodPlayUrl) {
                // 分割播放地址以及播放名称
                let vodPlayList = vodPlayUrl.split('#')
                let urls = vodPlayList.reduce((reduce, url) => {
                  if (url && url.indexOf('$') != -1) {
                    let splitArr = url.split('$')
                    reduce.push({
                      label: splitArr[0],
                      playUrl: splitArr[1]
                    })
                  }
                  return reduce
                }, [])

                reduce[vodPlayFrom] = urls
              }

              return reduce
            }, {})
            playDetail['playLists'] = urls
          }

          reslove(playDetail)
        }
      }
    )
  })
}

/**
 *  

 * @param {*} search 
 * @param {*} pageIndex 
 * @param {*} pageRow 
 * @returns 
 */
export const searchAllMoviceDb = async function (search = {}, pageIndex = 1, pageRow = 10) {
  pageIndex = pageIndex > 0 ? pageIndex - 1 : 0
  let sql = `SELECT
  vod_id vodId,
  vod_name vodName,
  vod_pic vodPic,
  vod_lang vodLang,
    vod_remarks vodRemarks,
    vod_content vodContent
FROM
  movice_list 
WHERE
  type_name NOT IN  ( '福利', '倫理片') 
 `
  sql = comparSearchContent(search, sql)
  let count = await searchAllMoviceCountDb(sql)
  return new Promise((reslove, reject) => {
    db.all(
      `${sql}
    LIMIT ${pageIndex * pageRow},${pageRow}`,
      (err, data) => {
        if (err) {
          reject(err)
        } else {
          reslove({
            total: count[0],
            pageIndex,
            pageRow,
            lists: data
          })
        }
      }
    )
  })
}

// 拼装搜索条件
function comparSearchContent(search = {}, sql = '') {
  const {
    bigType = '',
    typeName = '',
    vodName = '',
    vodLang = '',
    vodArea = '',
    vodYear = '',
    vodType
  } = search
  if (bigType) {
    // 设置总类
    let selects = typeSearchList[bigType]
    let notSqlStr = ''
    if (selects && selects['childs']) {
      let childs = selects['childs']
      let splitStr = childs.reduce((reduce, item) => {
        reduce += '"' + item + '"' + ','
        return reduce
      }, '')
      splitStr = splitStr.substring(0, splitStr.length - 1)
      notSqlStr = ' AND type_name IN ( ' + splitStr + ' )'
    }
    sql += notSqlStr
  }

  if (typeName) {
    sql += ` AND type_name='${typeName}'`
  }
  if (vodName) {
    sql += ` AND vod_name  like '%${vodName}%'`
  }
  if (vodLang) {
    sql += ` AND vod_lang='${vodLang}'`
  }
  if (vodArea) {
    sql += ` AND vod_area='${vodArea}'`
  }
  if (vodYear) {
    sql += ` AND vod_year='${vodYear}'`
  }
  if (vodType) {
    sql += ` ORDER BY vod_score DESC`
  } else {
    sql += ` ORDER BY
    vod_time,
    vod_year DESC`
  }

  return sql
}

// 查下搜索总数

const searchAllMoviceCountDb = function (sql) {
  sql = `SELECT COUNT(1) as count FROM (${sql} ) movice`

  return new Promise((reslove, reject) => {
    db.all(sql, (err, data) => {
      if (err) {
        reject(err)
      } else {
        reslove(data)
      }
    })
  })
}

// 插入历史播放数据 360看
export const insertMoviceSearchHistory = function (data) {
  const { vodId, vodName, vodContent, vodPic, coverInfo, vodRemarks, vodTag, vodSubname } = data
  let results = { ...data }
  delete results['playList']

  let insertSql = `
  INSERT INTO movice_search(vod_id,vod_name,vod_detail,vod_pic,vod_content,vod_remarks,
    data,created_date,vod_tags,spider_url,attribute1
    ) 
    VALUES ('${vodId}','${vodName}','${vodContent}','${vodPic}','${vodRemarks}','${JSON.stringify(
      coverInfo
    )}'
    ,'${JSON.stringify(results)}','${new Date()}','${JSON.stringify(
      vodTag
    )}','${vodSubname}','${vodId}')
    ON CONFLICT(vod_id) DO UPDATE SET data='${JSON.stringify(
      results
    )}',created_date='${new Date()}',
    attribute1='${vodId}'
  `
  return new Promise((reslove, reject) => {
    db.exec(insertSql, (err) => {
      if (err) {
        reject(err)
      } else {
        reslove( vodId)
      }
    })
  })
}

// 查询数据进行渲染播放页信息

export const selectMovicePlayData = function (id, type = 'play') {
  let andSql = ''
  if (type == 'play') {
    andSql = `and  vod_id='${id}'`
  }
  return new Promise((reslove, reject) => {
    db.all(
      `
      SELECT vod_id as vodId
      ,vod_name as vodName
      ,vod_detail as vodDetail
      ,vod_pic as vodPic
      ,vod_content as vodContent,vod_remarks vodRemarks,
      data,vod_tags vodTags,spider_url as spiderUrl,attribute1 FROM movice_search
      WHERE 1=1 ${andSql}
      ORDER BY created_date desc
    `,
      (err, result) => {
        if (err) {
          reject(err)
        } else {
          reslove(result)
        }
      }
    )
  })
}
