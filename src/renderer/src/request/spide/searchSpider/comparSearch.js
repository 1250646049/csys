import { startMoviceSearch } from './moviceSearchSpider'
import { startYunpanSearch } from './yunpanSpider'

export const startSearch = async function (args) {
  const { type = '' } = args
  if (type == 'movice') {
    await startMoviceSearch( args)
  } else if (type == 'yunpan') {
    await startYunpanSearch(args)
  } else {
    await startYunpanSearch(args)
    await startMoviceSearch(args)
  }
}
