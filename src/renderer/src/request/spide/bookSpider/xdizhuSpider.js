const request = require('request')
const cheerio = require('cheerio')

const urls = {
  lists: 'http://www.xdizhu.org/quanben/list/{pg}.html',
  baseUrl: 'http://www.xdizhu.org'
  // searchUrl: 'http://www.xdizhu.org/searchf4.html'
}
const typesurls = {
  玄幻: 'http://www.xdizhu.org/list/1_{pg}.html',
  仙侠: 'http://www.xdizhu.org/list/2_{pg}.html',
  都市: 'http://www.xdizhu.org/list/3_{pg}.html',
  历史: 'http://www.xdizhu.org/list/4_{pg}.html',
  网游: 'http://www.xdizhu.org/list/5_{pg}.html',
  科幻: 'http://www.xdizhu.org/list/6_{pg}.html',
  女生: 'http://www.xdizhu.org/list/7_{pg}.html',
  其他: 'http://www.xdizhu.org/list/8_{pg}.html'
}
const baseHeaders = {}



// 查询首页图书列表信息
export const findIndexBookList = function (pgData) {
  if (typeof pgData == 'string') {
    pgData = JSON.parse(pgData)
  }
  let pg = pgData['pg'] ? pgData['pg'] : 1
  let url = urls.lists.replace('{pg}', pg)
  if (pgData['cate'] == 'cate' && pgData['type']) {
    url = typesurls[pgData['type']].replace('{pg}', pg)
  }

  // console.log( urls.lists.replace('{pg}', pg),);
  return new Promise((reslove, reject) => {
    request.get(
      url,
      {
        headers: baseHeaders
      },
      (err, resp, data) => {
        if (err) {
          reject(err)
        } else {
          const $ = cheerio.load(data)
          let medias = $('.panel-body .media')
          let bookArray = []
          for (const item of medias) {
            const media = cheerio.load(item)
            let bookSrcElement = media('.media-left a ')
            let bookPicElement = media('.media-left a img')
            let bookBodyElement = media('.media-body h4 a')
            let bookAuthorElement = media('.media-body .book_author a')
            let bookDetailElement = media('.media-body p.book-intro-index')
            let bookPic = bookPicElement.attr('src')
            let bookSrc = bookSrcElement.attr('href')
            let bookTitle = bookBodyElement.text()
            let bookAuthor = bookAuthorElement.text()
            let bookDetail = bookDetailElement.text()
            bookArray.push({
              bookPic,
              bookSrc,
              bookTitle,
              bookAuthor,
              bookDetail,
              type: 'xdizhu'
            })
          }
          reslove(bookArray)
        }
      }
    )
  })
}

// 根据列表页查询数据

export const findDetailData = function (url) {
  if (!url) return
  return new Promise((reslove, reject) => {
    request.get(
      urls.baseUrl + url,
      {
        headers: { ...baseHeaders }
      },
      (err, resp, html) => {
        if (err) {
          reject(err)
        } else {
          let $ = cheerio.load(html)
          // 获取头内容
          let info = $('.pannel-body.info')
          let bookPicElement = info.find('.info1 img')
          let bookTitleElement = info.find('.info2 h1.text-center')
          let bookAuthorElement = info.find('.info2 h3.text-center')
          let bookContentElement = info.find('.info2 div>p')
          let bookItems = $('.panel-body.info3')
          let bookPic = bookPicElement.attr('src')
          let bookTitle = bookTitleElement.text()
          let bookAuthor = bookAuthorElement.text()
          let bookContent = bookContentElement.text()
          let bookAttribute1 = bookItems.find(' p:nth-child(1)').text()
          let bookAttribute2 = bookItems.find(' p:nth-child(2)').text()
          let bookAttribute3 = bookItems.find(' p:nth-child(3)').text()
          // 采集小说章节
          let listsElement = $('.panel.panel-default .panel-body:last-child .list-charts li')
          let bookList = listsElement
            .toArray()
            .filter((ele) => ele.firstChild && ele.firstChild.attribs)
            .map((ele, index) => {
              return {
                index,
                url: ele.firstChild ? ele.firstChild.attribs['href'] : '',
                txt: ele.firstChild ? ele.firstChild.attribs['title'] : ''
              }
            })
          reslove({
            bookPic,
            bookTitle,
            bookAuthor,
            bookContent,
            bookAttribute1,
            bookAttribute2,
            bookAttribute3,
            type: 'xdizhu',
            bookList
          })
        }
      }
    )
  })
}

// 根据url获取内容信息

export const getContentByUrl = function (data) {
  if (!data['url']) return
  let url = data['url']
  return new Promise((reslove, reject) => {
    request.get(urls.baseUrl + url, {}, (err, resp, data) => {
      if (err) {
        reject(err)
      } else {
        const $ = cheerio.load(data)
        // 本章标题
        let title = $('.active strong a').text()
        let bookTitle = $('.panel-heading').text()
        let bookContent = $('.content-body').html()
        let nextUrl = $('#next_url').attr('href')
        let prevUrl = $('#prev_url').attr('href')
        reslove({
          bookTitle,
          bookContent,
          nextUrl,
          prevUrl,
          curUrl: url,
          title
        })
      }
    })
  })
}

// 根据内容搜索
export const searchContent = async function (data) {
  let content = data['content']
  let url = await getSearchUrl()
  if (!content) return
  return new Promise((reslove, reject) => {
    request.post(
      urls.baseUrl+ url,
      {
        formData: {
          searchkey: content
        }
      },
      (err, resp, html) => {
        if (err) {
          reject(err)
        } else {
          const $ = cheerio.load(html)
          const bookcon = $('#bookcon >tbody tr')
          let bookLists = bookcon
            .toArray()
            .filter((item) => !$(item).attr('align'))
            .map((item, index) => {
              let ditem = $(item)
              let bookTitleEle = ditem.find('td:nth-child(2) p>a')
              let bookAuthorEle = ditem.find('td:nth-child(3) p>a')
              let bookUpdateEle = ditem.find('td:nth-child(4) p')
              let bookStatusEle = ditem.find('td:nth-child(5) p')
              return {
                bookTitle: bookTitleEle.text(),
                bookSrc: bookTitleEle.attr('href'),
                bookAuthor: bookAuthorEle.text(),
                bookUpdate: bookUpdateEle.text(),
                bookStatus: bookStatusEle.text(),
                type: 'xdizhu'
              }
            })
        
          reslove(bookLists)
        }
      }
    )
  })
}

// 先解析搜索地址
 const getSearchUrl = function () {
  return new Promise((reslove, reject) => {
    request.get(urls.baseUrl, {}, (err, resp, data) => {
      if (err) {
        reject(err)
      } else {
        const $ = cheerio.load(data)
        const url = $("[name='articlesearch']").attr('action')
        reslove(url)
      }
    })
  })
}
