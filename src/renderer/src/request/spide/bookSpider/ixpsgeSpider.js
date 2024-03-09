const request = require('request')
const cheerio = require('cheerio')
const URLS = require('url')
const iconv = require('iconv-lite')
const urls = {
  search: 'https://www.ixpsge.com/search.html?searchkey=',
  baseUrl: 'https://www.ixpsge.com/',
  contentUrl: 'https://www.ixpsge.com/novelsearch/reader/transcode/siteid/',
  type: 'ixpsge'
  // searchUrl: 'http://www.xdizhu.org/searchf4.html'
}

//   解析搜索内容
export const parseSearchLists = (data) => {
  let content = data['content']
  if (!content) {
    return
  }

  return new Promise((reslove, reject) => {
    request.get(urls.search + encodeURIComponent(content), {
      encoding: null
    }, (err, resp, html) => {
      if (err) {
        reject(err)
      } else {
        html = iconv.decode(html, 'utf8')
        const $ = cheerio.load(html)
        const bodyLists = $('.body .librarylist li')
        const lists = bodyLists.toArray().map((item) => {
          const ditem = $(item)
          return {
            bookPic: urls.baseUrl + ditem.find('.pt-ll-l a img').attr('src'),
            bookSrc: ditem.find('.pt-ll-l a ').attr('href'),
            bookTitle: ditem.find('.pt-ll-l a ').attr('title'),
            bookAuthor: ditem.find('.pt-ll-r .info span:nth-child(2)').text(),
            bookCategory: ditem.find('.pt-ll-r .info span:nth-child(3)').text(),
            bookContent: ditem.find('.pt-ll-r  .last').text(),
            type: urls.type
          }
        })

        reslove(lists)
      }
    })
  })
}

// 解析详情页面

export const parseDetailContent = (url) => {
  if (!url) return
  return new Promise((reslove, reject) => {
    request.get(
      urls.baseUrl + url,
      {
        encoding: null
      },
      (err, resp, html) => {
        if (err) {
          reject(err)
        } else {
          html = iconv.decode(html, 'utf8')
          const $ = cheerio.load(html)
          let bookTitle = $('.header h1').text()
          let bookAuthor = $('.novelinfo-l ul li:nth-child(1)').text()
          let bookPic = $('.novelinfo-r a img').attr('src')
          let bookContent = $('.body.novelintro ').text()
          let bookListEle = $('.fulldir .body  ul li')
          let attribute1 = $('.novelinfo-l ul li:nth-child(6)').text()
          let attribute2 = $('.novelinfo-l ul li:nth-child(7)').text()
          let bookList = bookListEle
            .toArray()
            .filter((item) => $(item).attr('class') != 'fulltip')
            .map((item, index) => {
              let ditem = $(item)
              return {
                index,
                txt: ditem.find('a').text(),
                url: ditem.find('a').attr('href')
              }
            })
          reslove({
            bookTitle,
            bookAuthor,
            bookPic: URLS.resolve(urls.baseUrl, bookPic),
            bookContent,
            bookList,
            type: urls.type,
            bookAttribute1: attribute1,
            bookAttribute2: attribute2,
            bookAttribute3: ''
          })
        }
      }
    )
  })
}

// 解析阅读页
export const parseReadContent = (url) => {
  if (!url) return
  return new Promise((reslove, reject) => {
    request.get(
      urls.baseUrl + url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        encoding: null
      },
      async (err, resp, html) => {
        if (err) {
          reject(err)
        } else {
          html = iconv.decode(html, 'utf8')
          const $ = cheerio.load(html)
          let title = $('.title h1').text()
          let bookTitle = $('.info span:nth-child(1) a').attr("title")
          let bookAuthor = $('.info span:nth-child(2) a').text()
          let bookContent = '解析内容失败~'
          let prevUrl = $('.operate ul li:first-child a').attr('href')
          let nextUrl = $('.operate ul li:last-child a').attr('href')
          try {
            bookContent = await parseContent(url)
          } catch (e) {}
          
          reslove({
            title:bookTitle,
            bookTitle:title.replace(bookTitle,''),
            bookAuthor,
            bookContent,
            nextUrl,
            prevUrl,
            curUrl: url,
            type:urls.type
          })
        }
      }
    )
  })
}
// 解析书内容
const parseContent = function (url) {
  if (!url) return
  url = url.replace('shu_', '').replace('.html', '/')

  return new Promise((reslove, reject) => {
    request.get(urls.contentUrl + url, {}, (err, resp, html) => {
      if (err) {
        reject(err)
      } else {
        html = iconv.decode(html, 'utf-8')
        reslove(JSON.parse(html)['info'])
      }
    })
  })
}
// parseReadContent('shu_2333/4297.html').then((r) => {
//   console.log(r)
// })
