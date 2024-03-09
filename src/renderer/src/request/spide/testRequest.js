const request = require('request')

// 搜索内容

// request.get("https://api.so.360kan.com/index?force_v=1&kw=1&from=&pageno=1&v_ap=1&tab=all&cb=",{
//     headers:{
//         "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
//     }
// },(err,resp,data)=>{
//     console.log(err);
//     // console.log(JSON.parse(data));
// })

//
const baseHeaders = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    "Referer":"https://www.360kan.com/tv/PLRpan7mSzbuNn.html"
}
request.get(
  'https://api.web.360kan.com/v1/detail?cat=2&id=PLRpan7mSzbuNn&start=1&end=36&site=imgo&callback=__jp8',
  {
    headers:{
        ...baseHeaders
    }
  },
  (err, resp, data) => {
    console.log(data)
  }
)
