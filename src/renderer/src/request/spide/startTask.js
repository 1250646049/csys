

import useStore from '../../store/setting'
import {spider2Lists} from "./feifanSpider"
import {reqZykuList} from "./zykuSpide"
import {spider2TianKonLists} from "./tiankonSpider"
const store = useStore()
// 开始采集数据插入数据库|采集非凡资源网|zyku资源网
export const startReqData2Db = async function (vodName=null) {
    // let result = await selectOne(selectMoviceListOneByCreateData)
    // 获取刷新时间限制捞取数据
    let spiderTime = store.$state.spiderTime
    var h = null
    if (spiderTime != -1) {
      h = spiderTime * 24
    }
    try {
      spider2Lists(1, null,vodName)
      reqZykuList(1, null,vodName)
      spider2TianKonLists(1,null,vodName)
    } catch (e) {
      alert(e)
    }
  }