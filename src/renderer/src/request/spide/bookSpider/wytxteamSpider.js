const request = require('request')
const cheerio = require('cheerio')
const URL = require('url')

const urls = {
  search: 'https://read.wytxteam.com/home/search',
  baseUrl: 'https://read.wytxteam.com/',
  type: 'wytxteam'
}

// 搜索内容
export const searchContent = function (data) {
  const content = data['content']
  if (!content) return
  return new Promise((reslove, reject) => {
    request.post(
      urls.search,
      {
        formData: {
          action: 'search',
          q: content
        }
      },
      (err, resp, html) => {
        if (err) {
          reject(err)
        } else {
          const $ = cheerio.load(html)
          const sitebox = $('#sitebox dl')
          let result = sitebox.toArray().map((item) => {
            const ditem = $(item)
            let bookSrcElement = ditem.find('dt:nth-child(1) a')
            let bookImgElement = bookSrcElement.find('img')
            let bookHeaderElement = ditem.find('dd:nth-child(2) span.uptime')
            let bookAuthorElement = ditem.find('dd:nth-child(3) span:nth-child(1)')
            let bookStatusElement = ditem.find('dd:nth-child(3) span:nth-child(2)')
            let bookTypeElement = ditem.find('dd:nth-child(3) span:nth-child(3)')
            let bookContentElement = ditem.find('dd:nth-child(4)')
            return {
              bookSrc: bookSrcElement.attr('href'),
              bookPic: URL.resolve(urls.baseUrl, bookImgElement.attr('src')),
              bookTitle: bookImgElement.attr('alt'),
              bookUpdate: bookHeaderElement.text(),
              bookAuthor: bookAuthorElement.text(),
              bookStatus: bookStatusElement.text(),
              bookType: bookTypeElement.text(),
              bookContent: bookContentElement.text(),
              type: urls.type
            }
          })
          reslove(result)
        }
      }
    )
  })
}

// 解析小说详情页面
export const parseDetailContent = function (url) {
  return new Promise((reslove, reject) => {
    request.get(urls.baseUrl + url, {}, (err, resp, data) => {
      if (err) {
        reject(err)
      } else {
        const $ = cheerio.load(data)
        const bookPicElement = $('.book-img img')
        const bookStatusElement = $('.book-stats b:nth-child(1)')
        const bookCategoryElement = $('.book-stats b:nth-child(2)')
        const bookStatusResultElement = $('.book-stats b:nth-child(3)')
        const bookAttribute3Element = $('.book-stats b:nth-child(4)')
        const bookContentElement = $('.book-intro')
        const lists = $('#allchapter .details>dl.chapterlist dd')
        let bookList = lists.toArray().map((item, index) => {
          const ditem = $(item)
          return {
            index,
            txt: ditem.find('a').text(),
            url: ditem.find('a').attr('href')
          }
        })
        bookList.sort((n1, n2) => n1['index'] - n2['index'])
        let result = {
          bookPic: URL.resolve(urls.baseUrl, bookPicElement.attr('src')),
          bookTitle: bookPicElement.attr('alt'),
          bookAuthor: bookStatusElement.text(),
          bookAttribute1: bookCategoryElement.text(),
          bookAttribute2: bookStatusResultElement.text(),
          bookAttribute3: bookAttribute3Element.text(),
          bookContent: bookContentElement.text(),
          bookList,
          type: urls.type
        }
        reslove(result)
      }
    })
  })
}

export const parseDetailReadContent = function (url) {
  return new Promise((reslove, reject) => {
    request.get(urls.baseUrl + url, {}, async(err, resp, data) => {
      if (err) {
        reject(err)
      } else {
        const $ = cheerio.load(data)
        const bookTitle = $('#BookCon h1').text()
        var bookContent = $('#BookText').html()
        let nextUrl = $('.link.xb a:nth-child(3)').attr('href')
        let prevUrl = $('.link.xb a:nth-child(1)').attr('href')
        let title = $('.crumbs a:nth-child(3)').text()
        let loadText = '<p class="preload">正在加载中……</p>'

        if (bookContent.trim().indexOf(loadText) != -1) {
          var reg = /var sourceurl = "(.*)";/
          let regArray = data.match(reg)
          if (regArray && regArray.length > 1) {
            let parOtherUrl = regArray[1]
            bookContent= await parseOtherPageUrl(parOtherUrl)
          }
        }


        reslove({
          title,
          bookContent,
          nextUrl,
          prevUrl,
          curUrl: url,
          bookTitle:bookTitle?bookTitle.replace(title,''):'',
          type: urls.type
        })
      }
    })
  })
}

// 如果解析不到内容 则会补解析
const parseOtherPageUrl = (url) => {
  if (!url) return ''
  return new Promise((reslove, reject) => {
    request.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      },
      (err, resp, data) => {
        if (err) {
          reject(err)
        } else {
          const $ = cheerio.load(data)
          const article = $('#article').html()
          reslove(article)
        }
      }
    )
  })
}

// parseDetailReadContent('read/81488/0.html').then((r) => {
//   console.log(r)
// })
// parseOtherPageUrl("https://ww5.doed.cn/read/404978/129441655.html")
