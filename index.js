import express from 'express';
import charset from 'superagent-charset';
import cheerio from 'cheerio';

const superagent = charset(require('superagent'));

const app = express();
const myPort = 3000;
let server = app.listen(myPort, () => {
  let { host, port } = server.address();
  console.log('Your App is running at http://localhost:' + myPort);
})

let baseInfo = [];

const getNeedData = () => {
  return new Promise((resolve, reject) => {
    superagent
      .get('https://isin.twse.com.tw/isin/C_public.jsp?strMode=2')  // 取得所有上市股票代碼和產業類型
      .charset()
      .end((err, res) => {
        if (err) {
          reject(`抓取失敗 - ${err}`);
          return;
        } else {
          let stockList = getListedCompanyInfoList(res);

          // 取得各股票最新基本資訊
          baseInfo = [];
          let currentCount = 0;
          stockList.forEach((stockInfo, idx) => {
            setTimeout(function () {
              fetchStockInfo(stockInfo).then(() => {
                currentCount++;
                if (currentCount === stockList.length) {
                  console.log(baseInfo);
                  resolve(baseInfo)
                }
              }, error => reject(error))
            }, idx * 500);
          })
        }
      });
  })
}

const fetchStockInfo = (stockInfo) => {
  return new Promise((resolve, reject) => {
    console.log(`get stock ${stockInfo.code}...`);
    superagent
      .get(`https://goodinfo.tw/StockInfo/StockFinDetail.asp?RPT_CAT=IS_M_QUAR_ACC&STOCK_ID=${stockInfo.code}`)
      .set({ "Content-Type": "application/json", "Accept": "application/json", 'user-agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36' })
      .end((err2, res2) => {
        if (err2) {
          reject(`抓取 ${stockInfo.code} 失敗 - ${err2}`);
          return;
        } else {
          baseInfo.push(getBaseInfo(res2, stockInfo));
          resolve();
        }
      });
  })
}

const getListedCompanyInfoList = (res) => {
  let $ = cheerio.load(res.text);
  let list = [];
  const table_tr = $('table.h4 tbody tr');
  for (let i = 0; i < table_tr.length; i++) {
    const data = {};
    const first_td = table_tr.eq(i).find('td');
    data.code = first_td.eq(0).text().split('　')[0];
    if (data.code === ' 上市認購(售)權證  ') break;
    data.name = first_td.eq(0).text().split('　')[1];
    data.listingDate = first_td.eq(2).text();
    data.industry = first_td.eq(4).text();
    list.push(data);
  }
  list.splice(0, 2);
  return list;
}

const getBaseInfo = (res, stockInfo) => {
  let $ = cheerio.load(res.text);
  let data = {};
  const table_tr_1 = $("table.std_tbl tbody tr:nth-child(1) td.head_td table.none_tbl tr:nth-child(1)");
  Object.keys(stockInfo).forEach(infoKey => {
    data[infoKey] = stockInfo[infoKey];
  })
  for (let i = 0; i < table_tr_1.length; i++) {
    const table_td = table_tr_1.eq(i).find('td');
    data.priceEvaluation = table_td.eq(1).text();
    data.PBREvaluation = table_td.eq(2).text();
    data.date = table_td.eq(3).text().substr(6);
  }
  const table_tr_3 = $("table.std_tbl tbody tr:nth-child(3)");
  for (let i = 0; i < table_tr_3.length; i++) {
    const table_td = table_tr_3.eq(i).find('td');
    data.strikePrice = table_td.eq(0).text();
    data.priceFluctuation = table_td.eq(1).text();
    data.changeFluctuation = table_td.eq(2).text();
    data.lastClose = table_td.eq(3).text();
    data.openingPrice = table_td.eq(4).text();
    data.maxPrice = table_td.eq(5).text();
    data.minPrice = table_td.eq(6).text();
  }
  $('table.std_tbl tbody tr:nth-child(5) td:nth-child(6)').each((index, element) => {
    data.PER = $(element).text();
  })
  $('table.std_tbl tbody tr:nth-child(5) td:nth-child(7)').each((index, element) => {
    data.PBR = $(element).text();
  })

  return data;
}

app.get('/', async (req, res, next) => {
  getNeedData().then((data) => {
    res.send(data);
  }, (error) => {
    res.send(error);
  })
});