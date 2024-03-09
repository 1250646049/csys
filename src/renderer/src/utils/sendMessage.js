const { ipcRenderer } = require('electron')


/**
 * 发送头部最大化|最小化事件
 */

export function sendMinxMaxCloseType(type){
//    const {ipcRenderer}=window.electron
   ipcRenderer.send("MinxMaxCloseType",type)
    // console.log(remote);

}


// 拖动事件

export function sendWindowRagEvent(flag){
    ipcRenderer.send("window-move-open",flag)
}


// 发送数据源操作窗口

export function sendDbWindowsEvent(params){
    ipcRenderer.send("dbWindowsEvent",params)
}


// 爬虫发送给子窗口事件 ynku
export function sendSpiderEvent(data){
    ipcRenderer.send("spiderEvent",data)
}

// 爬虫发送给子窗口事件 360
export function sendSpiderBy360Event(data){
    ipcRenderer.send("getSpiderBy360Event",JSON.stringify(data))
}

// 爬虫发给搜索页面主窗口事件

export function sednMainWindowBySearchEvent(data){
    ipcRenderer.send("sednMainWindowBySearchEvent",JSON.stringify(data))
}