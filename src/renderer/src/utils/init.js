
import {sendDbWindowsEvent} from "./sendMessage"
// 显示本地数据源
import "../request/db/initBaseTable"
  
  
// app初始化则会加载
export function initBaseData(mode="db"){
    // 初始化基础数据源
 
    if(mode=="db"){
        // 显示爬虫
        sendDbWindowsEvent({
            show: false,
            url: "db",
          });
    }
}