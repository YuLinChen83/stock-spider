import express from 'express';
import superagent from 'superagent';
import cheerio from 'cheerio';

const app = express();
const myPort = 3000;
let server = app.listen(myPort, () => {
  let { host, port } = server.address();
  console.log('Your App is running at http://localhost:' + myPort);
})

let baseInfo = [];

superagent
.get('https://goodinfo.tw/StockInfo/StockFinDetail.asp?RPT_CAT=IS_M_QUAR_ACC&STOCK_ID=2449')
.set({ "Content-Type": "application/json", "Accept": "application/json", 'user-agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36' })
.end((err, res) => {
  if (err) {
    console.log(`抓取失敗 - ${err}`)
  } else {
    // console.log(res);
    baseInfo = getBaseInfo(res)
  }
});

const keyMap = {
  priceEvaluation: '股價評估',
  PBREvaluation: 'PBR評估',
  dataDate: '資料日期',
  strikePrice: '成交價',
  priceFluctuation: '漲跌價',
  changeFluctuation:'漲跌幅',
  lastClose: '昨收',
  openingPrice: '開盤價',
  maxPrice: '最高價',
  minPrice: '最低價',
  PER: 'PER',
  PBR: 'PBR'
}
const getBaseInfo = (res) => {
  let $ = cheerio.load(res.text);
  const data = {};
  const tempDaraArray = [];
  $('table.std_tbl tbody tr:nth-child(1) td.head_td table.none_tbl tr:nth-child(1) td').each((index, element) => {
    // console.log($(element).text());
    if(index===0) {
      data.code = $(element).text().substring(0,4);
      data.name = $(element).text().substring(5, $(element).text().length)
    }
    else tempDaraArray.push($(element).text());
  })
  $('table.std_tbl tbody tr:nth-child(3) td').each((index, element) => {
    // console.log($(element).text());
    tempDaraArray.push($(element).text());
  })
  $('table.std_tbl tbody tr:nth-child(5) td:nth-child(6)').each((index, element) => {
    // console.log($(element).text());
    tempDaraArray.push($(element).text());
  })
  $('table.std_tbl tbody tr:nth-child(5) td:nth-child(7)').each((index, element) => {
    // console.log($(element).text());
    tempDaraArray.push($(element).text());
  })

  const keyArray = Object.keys(keyMap);
  tempDaraArray.forEach((item, idx) => {
    data[keyArray[idx]] = item;
  })

  return data;
}

app.get('/', async (req, res, next) => {
  res.send(baseInfo);
});