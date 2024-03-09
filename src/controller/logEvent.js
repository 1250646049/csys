import logger from 'electron-log'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { app } from 'electron'
// import { remote } from 'electron'
// 可以将文件放置到指定文件夹中，例如放到安装包文件夹中
// const path = require('path')

// 需要新建一个日志目录

logger.transports.file.level = true
logger.transports.file.maxSize = 1002430 // 最大不超过10M
logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}' // 设置文件内容格式
let date = new Date()
date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
// 指定存储位置 
logger.transports.file.resolvePathFn = () =>  ("logs"+"/"+date + '.log')
export default logger
