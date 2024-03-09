import { selectIndexHotPlayDb, selectIndexYSJPlayDb, searchMoviceContentDb } from './db/indexSelect'
import { selectMoviceById, searchAllMoviceDb } from './db/detailPlay'
// 查询 首页热播精选

export const selectIndexHotPlay = (pageIndex, pageRow, mode = 'db') => {
  return new Promise(async (reslove, reject) => {
    try {
      let result = []
      if (mode == 'db') {
        result = await selectIndexHotPlayDb(pageIndex, pageRow)
      } else {
      }
      reslove(result)
    } catch (e) {
      reject(e)
    }
  })
}

// 查询首页其他内容的推荐
export const selectIndexYSJPlay = (pageIndex, pageRow, type, mode = 'db') => {
  return new Promise(async (reslove, reject) => {
    try {
      let result = []
      if (mode == 'db') {
        result = await selectIndexYSJPlayDb(pageIndex, pageRow, type)
      } else {
      }
      reslove(result)
    } catch (e) {
      reject(e)
    }
  })
}

// 根据视频ID查询影片详情

export const selectMoviceDetailById = async (voidId, mode = 'db') => {
  if (!voidId) return
  let result = {}
  try {
    if (mode == 'db') {
      result = await selectMoviceById(voidId)
    }
  } catch (e) {}

  return result
}

// 搜索视频内容

export const searchMoviceContent = async (content, pageIndex = 1, pageRow = 10, mode = 'db') => {
  let result = []
  if (mode == 'db') {
    result = await searchMoviceContentDb(content, pageIndex, pageRow)
  }

  return result
}

// 搜索内容检索数据

export const searchAllMovice = async (search = {}, pageIndex = 1, pageRow = 10, mode = 'db') => {
  let result = []
  if (mode == 'db') {
    result = await searchAllMoviceDb(search, pageIndex, pageRow)
  }
  return result
}
