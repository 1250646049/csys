import db from './sqlitDb'
import { typeSearchList } from '../../config/indexConstConfig'
/**
 * 查询首页当季热播
 */

export const selectIndexHotPlayDb = (pageIndex = 1, pageRow = 10) => {
  pageIndex = pageIndex > 0 ? pageIndex - 1 : 0
  return new Promise((reslove, reject) => {
    db.all(
      `SELECT

	vod_id vodId,
	vod_name vodName,
	vod_pic vodPic,
	vod_lang vodLang,
    vod_remarks vodRemarks,
    vod_content vodContent
FROM
	movice_list 
WHERE
	type_name IN ( '剧情片', '动作片', '国产剧', '大陆综艺' ) 
	AND vod_area IN ( '大陆' ) 
	AND vod_lang IN ( '国语' ) 
ORDER BY
	vod_time,
	vod_year DESC 
	LIMIT ${pageIndex * pageRow},${pageRow}
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

/**
 * 查询首页影视剧推荐
 */

export const selectIndexYSJPlayDb = (pageIndex = 1, pageRow = 10, type) => {
  pageIndex = pageIndex > 0 ? pageIndex - 1 : 0
  let selects = typeSearchList[type]
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
  return new Promise((reslove, reject) => {
    db.all(
      `
        SELECT
	vod_id vodId,
	vod_name vodName,
	vod_pic vodPic,
	vod_lang vodLang,
    vod_remarks vodRemarks,
    vod_content vodContent
FROM
	movice_list 
WHERE
       1=1
       ${notSqlStr} 
ORDER BY
	vod_time,
	vod_year DESC 
	LIMIT ${pageIndex * pageRow},
	${pageRow}
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

/**
 * 搜索影片内容
 */
export const searchMoviceContentDb = (content, pageIndex = 1, pageRow = 10) => {
  if (!content) {
    content = ''
  }
  pageIndex = pageIndex > 0 ? pageIndex - 1 : 0

  return new Promise((reslove, reject) => {
    db.all(
      `SELECT

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
  AND   vod_name like '%${content}%'
ORDER BY
  vod_time,
  vod_year DESC 
  LIMIT ${pageIndex * pageRow},${pageRow}`,
      (err, data) => {
        if (err) {
          reject(err)
        } else {
          data = data.map((item) => {
            let vodName = item['vodName']
            if (vodName.indexOf(content) != -1) {
              vodName = vodName.replaceAll(content, `<span style='color:red'>${content}</span>`)
            }
            item['vodName'] = vodName
            return item
          })
          reslove(data)
        }
      }
    )
  })
}
