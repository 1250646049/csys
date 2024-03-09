import {ipcMain} from "electron"


export function createSearchListener(searchWindow) {

    // 子窗口中转事件监听
    ipcMain.handle("searchYunpanSearchEvent",(event,args)=>{

        if(searchWindow){  
            searchWindow.webContents.send("searchYunpanSearchListenerEvent",args)
        }
    })

}