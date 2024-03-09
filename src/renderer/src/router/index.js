import { createWebHashHistory, createRouter } from 'vue-router'

const routes = [
  // 主页
  {
    path: '/main', 
    name: 'main',
    component: () => import('../view/mainView.vue')
  },
  // {
  //   path: '/index',
  //   name: 'index',
  //   component: () => import('../view/indexView.vue'),
  // },
  // 播放器
  {
    path: '/play',
    name: 'play',
    component: () => import('../view/playView.vue')
  },
  // 视频播放详情页面
  {
    path: '/detail',
    name: 'detail',
    component: () => import('../view/playDetail.vue')
  },
  // 其他视频播放平台
  {
    path: '/otherPlay',
    name: 'otherPlay',
    component: () => import('../view/otherPlay.vue')
  },
  // 详细搜索页面
  {
    path: '/playSearch',
    name: 'playSearch',
    component: () => import('../view/playSearchView.vue')
  },
  // 搜索页面
  // {
  //   path:"/search",
  //   name:"search",
  //   component: () => import('../view/search/searchView.vue')
  // },
  {
    path:"/searchSpider",
    name:"searchSpider",
    component: () => import('../view/search/searchSpider.vue')
  },

  // 404页面
  {
    path: '/404',
    name: '404',
    component: () => import('../view/error/404.vue')
  },

  // db子窗口
  {
    path: '/db',
    name: 'db',
    component: () => import('../view/db/dbMainView.vue'),
    children: [
      {
        path: 'spider',
        name: 'spider',
        component: () => import('../view/db/spiderView.vue')
      },
      {
        redirect: '/db/spider',
        path: '/db'
      }
    ]
  },
  // book子窗口
  {
    path: '/bookSpider',
    name: 'bookSpider',
    component: () => import('../view/book/bookSpiderView.vue')
  },

  // 小说章节
  {
    path: '/bookDetail',
    name: 'bookDetail',
    component: () => import('../view/bookDetailView.vue')
  },
  // 小说阅读页
  {
    path: '/bookRead',
    name: 'bookRead',
    component: () => import('../view/bookReadView.vue')
  },
  {
    path: '/',
    redirect: '/main'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
