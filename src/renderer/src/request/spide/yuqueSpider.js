const request = require('request')

const urls = {
  write: 'https://www.yuque.com/api/docs/kym3mpidgzhkgrbs?book_id=44562874'
}

// 请求服务是否暂停
export const requestWirteBuUpdate = () => {
  return new Promise((reslove, reject) => {
    request.get(urls.write, {}, (err, resp, data) => {
      if (err) {
        reject(err)
      } else {
        const { status } = JSON.parse(data)
        if(status==404){
            reject(404)
        }else {
            reslove(200)
        }
       
      }
    })
  })
}
