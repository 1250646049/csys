import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// 日志输出
const LOG = function (data) {
  ipcRenderer.invoke('CONSOLE', JSON.stringify(data))
}

// 刷新系统
const freshWindows = function () {
  ipcRenderer.invoke('freshWindows', true)
}

// 显示小说窗口
const createBookWindow = async function (params) {
  let flag = await ipcRenderer.invoke('bookWindowsEvent', params)
  return flag
}

// 获取当前执行目录
const getCurExeApp = function () {
  let path = ipcRenderer.invoke('getCurExeApp', '')
  return path
}

// 打开默认url
const opDefaultUrl=function(url){
  ipcRenderer.invoke("opDefaultUrl",url)
  return true;
}
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('LOG', LOG)
    contextBridge.exposeInMainWorld('freshWindows', freshWindows)
    contextBridge.exposeInMainWorld('createBookWindow', createBookWindow)
    contextBridge.exposeInMainWorld('getCurExeApp', getCurExeApp)
    contextBridge.exposeInMainWorld('opDefaultUrl', opDefaultUrl)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
  window.LOG = LOG
  window.freshWindows = freshWindows
  window.createBookWindow = createBookWindow
  window.getCurExeApp = getCurExeApp
  window.opDefaultUrl=opDefaultUrl
}
