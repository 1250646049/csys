import { app, ipcMain, session, BrowserView,shell } from 'electron'
import Logger from './logEvent'
import path from 'path'
export function createMainWindowListener(mainWindow) {
  // 接受子窗口传来的数据
  ipcMain.on('getSpiderBy360Event', (event, args) => {
    if (mainWindow) {
      mainWindow.webContents.send('getSpiderBy360Event', args)
    }
  })
  // 子窗口传给主窗口消息
  ipcMain.on('sednMainWindowBySearchEvent', (event, args) => {
    if (mainWindow) {
      mainWindow.webContents.send('sednMainWindowBySearchEvent', args)
    }
  })

  // 日志输出
  ipcMain.handle('CONSOLE', (event, data) => {
    Logger.info(data)
  })
  // 获取当前执行目录
  ipcMain.handle('getCurExeApp', (event, data) => {
    return app.getPath('exe')
  })

  // 刷新系统
  ipcMain.handle('freshWindows', (event, flag) => {
    mainWindow.webContents.reload()
  })

  // 小说爬虫监听器列表页
  ipcMain.handle('BookSpiderData', async (event, strData) => {
    mainWindow.webContents.send('BookSpiderDataListener', strData)
  })
  // 小说爬虫监听器
  ipcMain.handle('BookSpiderDetail', async (event, strData) => {
    mainWindow.webContents.send('BookSpiderDetailListener', strData)
  })
  // 小说阅读页监控
  ipcMain.handle('startReadBookContent', async (event, data) => {
    mainWindow.webContents.send('startReadBookContent', data)
  })

  // 子窗口搜索到的内容 返回给主窗口
  ipcMain.handle('startSearchContent', async (event, data) => {
    mainWindow.webContents.send('startSearchContentListener', data)
  })

  // 搜索板块内容
  ipcMain.handle('startYunpanSearchListener', (event, arag) => {
    mainWindow.webContents.send('startSearchContentEventListener', arag)
  })

  // 打开默认url
  ipcMain.handle("opDefaultUrl",(event,url)=>{
    shell.openExternal(url)
  })
}

// 监控请求地址
export function createMainWindowSession(mainWindow) {}
