import { ipcMain } from 'electron'

export function createBookWindowEvent(bookWindow) {
  // 窗口获取主窗口的信息
  ipcMain.handle('getBookDataList', async (event, data) => {
    if (bookWindow) {
      bookWindow.webContents.send('getBookDataList', data)
    }
  })
  // 窗口获取子窗口根据地址信息查询数据
  ipcMain.handle('BookSpiderDetailEvent', async (event, data) => {
    if (bookWindow) {
      bookWindow.webContents.send('BookSpiderDetailEvent', data)
    }
  })

  // 窗口获取子窗口根据地址信息开始小说阅读
  ipcMain.handle('sendStartReadContent', async (event, data) => {
    if (bookWindow) {
      bookWindow.webContents.send('sendStartReadContent', data)
    }
  })

  // 主窗口告知子窗口开始搜索内容事件
  ipcMain.handle('startSearchContentEvent', async (event, data) => {
    if (bookWindow) {
      bookWindow.webContents.send('startSearchContentEvent', data)
    }
  })


}
