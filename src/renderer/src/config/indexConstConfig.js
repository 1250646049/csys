/**
 * 首页导航栏通用设置
 */

export const indexRouters = [
  {
    id: 1,
    label: '首页',
    icon: 'iconfont icon-shouye',
    component: 'main'
  },
  {
    id: 2,
    label: '电视剧',
    icon: 'iconfont icon-dianshiju ',
    component: 'playSearch'
  },
  {
    id: 3,
    label: '电影',
    icon: 'iconfont icon-dianying ',
    component: 'playSearch'
  },
  {
    id: 4,
    label: '综艺',
    icon: 'iconfont icon-zongyi',
    component: 'playSearch'
  },
  {
    id: 5,
    label: '动漫',
    icon: 'iconfont icon-dongman',
    component: 'playSearch'
  }

]

// 筛选列表
export const typeSearchList = {
  电视剧: {
    childs: ['国产剧', '台湾剧', '韩国剧', '欧美剧', '香港剧', '日本剧', '海外剧']
  },
  电影: {
    childs: [
      '动作片',
      '爱情片',
      '喜剧片',
      '科幻片',
      '恐怖片',
      '剧情片',
      '战争片',
      '记录片',
      '动画片'
    ]
  },
  综艺: {
    childs: ['大陆综艺', '港台综艺', '日韩综艺', '欧美综艺']
  },
  动漫: {
    childs: ['国产动漫', '日韩动漫', '欧美动漫', '港台动漫', '海外动漫']
  }
}

export const allAddressList = [
  '大陆',
  '台湾',
  '香港',
  '俄罗斯',
  '加拿大',
  '印度',
  '德国',
  '意大利',
  '新加坡',
  '日本',
  '法国',
  '波兰',
  '泰国',
  '澳大利亚',
  '瑞典',
  '美国',
  '英国',
  '菲律宾',
  '西班牙',
  '韩国',
  '马来西亚',
  '其它'
]

// 全部时间搜索
export const allTimeSearchFun = (maxDev = 25) => {
  let date = new Date()
  let fullYear = date.getFullYear()
  let yearArr = []
  for (let i = fullYear; i >= fullYear - maxDev; i--) {
    yearArr.push(i)
  }
  return yearArr
}
