import {ipcMain} from "electron"


export function createDbListener(dbWindow) {
  // 主窗口调用子窗口查询数据
  ipcMain.on('sendSpiderBy360Event', (event, args) => {
    if (dbWindow) {
      dbWindow.webContents.send('sendChildSpiderBy360Event', args)
    }
  })

  // 接受主窗口传来的跟进影片名称获取数据

  ipcMain.on('onSyncByName', (event, args) => {
    if (dbWindow) {
      dbWindow.webContents.send('onSyncByName', args)
    }
  })

  // 接受子窗口 获取数据 转发给子窗口渲染进程

ipcMain.on('spiderEvent', (event, args) => {
    if (dbWindow) {
      dbWindow.webContents.send('spiderEvent', args)
    }
  })
}
