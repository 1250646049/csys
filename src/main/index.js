import { app, shell, BrowserWindow, ipcMain, screen, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// 桌面状态记录
const createWindowState = require('electron-window-state')

// 控制器
import { windowFullListener } from '../controller/windowOprea'
import { createDbListener } from '../controller/dbWindowEvent'
import { createMainWindowListener, createMainWindowSession } from '../controller/mainWindowEvent'
import { createBookWindowEvent } from '../controller/bookWindowEvent'
import {createSearchListener} from "../controller/searchWindowEvent"
// 创建托盘
import { createTray } from '../tray/tray'

var mainWindow = null
function createWindow() {
  const windowState = new createWindowState({
    defaultHeight: 900,
    height: 670
  })
  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    show: false,
    frame: false,
    titleBarOverlay: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      javascript: true,
      webSecurity: false,
      webviewTag: true,
      contextIsolation: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 监听窗口是否全屏
  windowFullListener(mainWindow)

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  createTray(mainWindow, app)
  windowState.manage(mainWindow)
  // 主窗口事件监听
  createMainWindowListener(mainWindow)
}

// 创建操作数据库的窗口
var dbWindow = null
function createDbWindow(params) {
  const point = screen.getPrimaryDisplay().size

  dbWindow = new BrowserWindow({
    width: 300,
    height: 300,
    resizable: false,
    maxHeight: 300,
    maxWidth: 300,
    x: point.width - 300,
    y: point.height - 300,
    show: params['show'],
    frame: false,

    titleBarOverlay: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    preload: join(__dirname, '../preload/index.js'),
    webPreferences: {
      sandbox: false,
      nodeIntegration: true,
      javascript: true,
      webSecurity: false,
      webviewTag: true,
      contextIsolation: false,
      plugins: true
    }
  })

  // 关闭事件
  dbWindow.on('closed', () => {
    dbWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    dbWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#' + params['url'])
  } else {
    dbWindow.loadURL(join(__dirname, '../renderer/index.html#' + params['url']))
  }

  // 创建子窗口的事件监听
  createDbListener(dbWindow)
}

// 创建小说操作数据库的窗口
var bookWindow = null
function createBookWindow(params) {
  const point = screen.getPrimaryDisplay().size

  bookWindow = new BrowserWindow({
    width: 300,
    height: 300,
    resizable: false,
    maxHeight: 300,
    maxWidth: 300,
    x: point.width - 300,
    y: point.height - 300,
    show: params['show'],
    frame: false,

    titleBarOverlay: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    preload: join(__dirname, '../preload/index.js'),
    webPreferences: {
      sandbox: false,
      nodeIntegration: true,
      javascript: true,
      webSecurity: false,
      webviewTag: true,
      contextIsolation: false
    }
  })

  // 关闭事件
  bookWindow.on('closed', () => {
    dbWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    bookWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#' + params['url'])
  } else {
    bookWindow.loadURL(join(__dirname, '../renderer/index.html#' + params['url']))
  }

  createBookWindowEvent(bookWindow)
}

// 创建搜索窗口
var searchWindow = null
function createSearchWindow(params) {
  const point = screen.getPrimaryDisplay().size

  searchWindow = new BrowserWindow({
    width: 300,
    height: 300,
    resizable: false,
    maxHeight: 300,
    maxWidth: 300,
    x: point.width - 300,
    y: point.height - 300,
    show: params['show'],
    frame: false,

    titleBarOverlay: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    preload: join(__dirname, '../preload/index.js'),
    webPreferences: {
      sandbox: false,
      nodeIntegration: true,
      javascript: true,
      webSecurity: false,
      webviewTag: true,
      contextIsolation: false
    }
  })

  // 关闭事件
  searchWindow.on('closed', () => {
    dbWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    searchWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#' + params['url'])
  } else {
    searchWindow.loadURL(join(__dirname, '../renderer/index.html#' + params['url']))
  }
  createSearchListener(searchWindow)
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  createMainWindowSession(mainWindow)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**
 * 操作窗口关闭|最小化|最大化
 */
ipcMain.on('MinxMaxCloseType', (_, arags) => {
  const window = BrowserWindow.getFocusedWindow()
  switch (arags) {
    case 0: {
      window.minimize()
      break
    }
    case 1: {
      let flag = window.isMaximized()
      if (flag) {
        window.restore()
      } else {
        window.maximize()
      }
      break
    }
    case 2: {
      if (window == mainWindow) {
        app.exit()
      } else {
        window.close()
      }

      break
    }
  }
})

// 获取触发事件的窗口
function getWindowByEvent(event) {
  const webContentsId = event.sender.id
  for (const currentWin of BrowserWindow.getAllWindows()) {
    if (currentWin.webContents.id === webContentsId) {
      return currentWin
    }
  }
  return null
}
// 窗口拖动事件
/** 窗口移动功能封装 */
// 窗口移动 位置刷新定时器
let movingInterval = null
/**
 * 窗口移动事件
 */
ipcMain.on('window-move-open', (event, canMoving) => {
  let winStartPosition = { x: 0, y: 0 }
  let mouseStartPosition = { x: 0, y: 0 }
  const currentWindow = getWindowByEvent(event)
  const currentWindowSize = currentWindow.getSize()

  if (currentWindow) {
    if (canMoving) {
      // 读取原位置
      const winPosition = currentWindow.getPosition()
      winStartPosition = { x: winPosition[0], y: winPosition[1] }
      // 获取当前鼠标聚焦的窗口
      mouseStartPosition = screen.getCursorScreenPoint()

      // 清除旧的定时器
      if (movingInterval) {
        clearInterval(movingInterval)
      }
      // 创建定时器，每10毫秒更新一次窗口位置，保证一致
      movingInterval = setInterval(() => {
        // 窗口销毁判断，高频率的更新有可能窗口已销毁，定时器还没结束，此时就会出现执行销毁窗口方法的错误
        if (!currentWindow.isDestroyed()) {
          // 如果窗口失去焦点，则停止移动
          if (!currentWindow.isFocused()) {
            clearInterval(movingInterval)
            movingInterval = null
          }
          // 实时更新位置
          const cursorPosition = screen.getCursorScreenPoint()
          const x = winStartPosition.x + cursorPosition.x - mouseStartPosition.x
          const y = winStartPosition.y + cursorPosition.y - mouseStartPosition.y
          // 更新位置的同时设置窗口原大小， windows上设置=>显示设置=>文本缩放 不是100%时，窗口会拖拽放大

          currentWindow.setBounds({
            x: x,
            y: y,
            width: currentWindowSize[0],
            height: currentWindowSize[1]
          })
        }
      }, 10)
    } else {
      clearInterval(movingInterval)
      movingInterval = null
    }
  }
})

// 接受子窗口 db窗口事件
ipcMain.on('dbWindowsEvent', (event, arags) => {
  if (!dbWindow) {
    createDbWindow(arags)
    dbWindow.focus()
  }
})

// 接受子窗口 book窗口事件
ipcMain.handle('bookWindowsEvent', (event, arags) => {
  if (!bookWindow) {
    createBookWindow(arags)
    bookWindow.focus()
  }
  return true
})
// 接受搜索窗口事件
ipcMain.handle('searchWindowEvent', (event, args) => {
  if (!searchWindow) {
    createSearchWindow(args)
    searchWindow.focus()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
