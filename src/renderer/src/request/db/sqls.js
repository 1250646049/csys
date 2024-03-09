// 根据创建日期降序获取最近一次入库的数据
export const selectMoviceListOneByCreateData = `SELECT * FROM movice_list ORDER BY vod_time DESC LIMIT 1`

// 批量插入视频头数据
export const insertMoviceListData = `INSERT  INTO movice_list(vod_id,vod_name,vod_enname,vod_subname,
    vod_time,vod_letter,vod_color,type_id,type_name,vod_pic,vod_lang,vod_area,vod_year,vod_remarks,vod_actor,
    vod_director,vod_play_from,vod_content,vod_score,vod_hits,vod_sub,vod_play_note,vod_tag ) VALUES `

export const moviceListFields = [
  'vod_id',
  'vod_name',
  'vod_enname',
  'vod_subname',
  'vod_time',
  'vod_letter',
  'vod_color',
  'type_id',
  'type_name',
  'vod_pic',
  'vod_lang',
  'vod_area',
  'vod_year',
  'vod_remarks',
  'vod_actor',
  'vod_director',
  'vod_play_from',
  'vod_content',
  'vod_score',
  'vod_hits',
  'vod_sub',
  'vod_play_note',
  'vod_tag'
]


// 批量插入视频行数据

export const insertMoviceDetailData=`INSERT  INTO movice_detail(vod_id,vod_play_url,vod_play_from,vod_time) VALUES `

