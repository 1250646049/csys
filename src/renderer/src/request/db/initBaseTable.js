import db from './sqlitDb'
/**
 * 创建基础表 列表表
 */
const moviceListTable = `
CREATE TABLE IF NOT EXISTS "movice_list" (
    "vod_id" TEXT(200) NOT NULL ,
    "vod_name" text(100),
    "vod_enname" TEXT(200),
    "vod_subname" TEXT(200),
    "vod_time" DATE,
    "vod_letter" TEXT(200),
    "vod_color" TEXT(200),
    "type_id" INTEGER(11),
    "type_name" TEXT(100),
    "vod_pic" TEXT(500),
    "vod_lang" TEXT(100),
    "vod_area" TEXT(100),
    "vod_year" TEXT(100),
    "vod_remarks" TEXT,
    "vod_actor" TEXT,
    "vod_director" TEXT,
    "vod_play_from" TEXT(200),
    "vod_content" TEXT,
    "vod_score" TEXT,
    "vod_hits" TEXT,
    "vod_sub" TEXT,
    "vod_play_note" TEXT,
    "vod_tag" TEXT,
    "attribute1" TEXT,
    "attribute2" TEXT,
    "attribute3" TEXT,
    "attribute4" TEXT,
    "attribute5" TEXT,
    PRIMARY KEY ( "vod_id")
  );
`

db.exec(moviceListTable, (err) => {
  if (err) {
    console.log(err)
  } else {
    console.log('创建成功~')
  }
})

/**
 * 创建详情表
 */

const moviceDetailTable = `
CREATE TABLE  IF NOT EXISTS "movice_detail" (
    "movice_detail_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vod_id" TEXT(200) NOT NULL ,
    "vod_play_url" TEXT,
    "vod_play_from" TEXT NOT NULL,
    "vod_time" DATE,
    "attribute1" TEXT,
    "attribute2" TEXT,
    "attribute3" TEXT,
    "attribute4" TEXT,
    "attribute5" TEXT
  );
`

db.exec(moviceDetailTable, (err) => {
  if (err) {
    console.log(err)
  } else {
    console.log('创建详情表成功')
  }
})


/**
 * 创建全网搜索记录表
 */

const moviceSearchTable =`
CREATE TABLE IF NOT EXISTS "movice_search" (
  "vod_id" TEXT(200) NOT NULL,
  "vod_name" TEXT,
  "vod_detail" TEXT,
  "vod_pic" TEXT,
  "vod_content" TEXT,
  "vod_remarks" TEXT,
  "data" TEXT,
  "created_date" DATE,
  "vod_tags" TEXT,
  "spider_url" TEXT,
  "attribute1" TEXT,
  "attribute2" TEXT,
  "attribute3" TEXT,
  "attribute4" TEXT,
  "attribute5" TEXT,
  PRIMARY KEY ("vod_id")
);

`

db.exec(moviceSearchTable, (err) => {
  if (err) {
    console.log(err)
  } else {
    console.log('创建全网搜索表成功')
  }
})
