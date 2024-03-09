import router from './index'
import { requestWirteBuUpdate } from '../request/spide/yuqueSpider'

// 判断服务是否暂停提供
router.beforeEach(async (to, from, next) => {
  router['form']=from;
  router['to']=to;
  // 判断服务是否暂停
  try {
    let useFlag = window.sessionStorage.getItem('serviceCanUse')
    if (useFlag) {
      return next()
    }
    await requestWirteBuUpdate()
    // 设置本次服务可用
    window.sessionStorage.setItem('serviceCanUse', 1)
    next()
  } catch (e) {
    console.log(from);
    if (to.name == '404' ) {
      next()
    } else {
      next('404')
    }
  }
})
