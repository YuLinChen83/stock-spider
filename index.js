import express from 'express';
import charset from 'superagent-charset';
import dayjs from 'dayjs';
import { getListedCompanyInfoList, getBaseInfo } from './getNeedData';
import { db } from './db';

const today = dayjs(new Date()).format('YYYYMMDD');
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
          stockList.filter((a, i) => i < 3).forEach((stockInfo, idx) => {
            setTimeout(function () {
              fetchStockInfo(stockInfo).then(() => {
                currentCount++;
                if (currentCount === stockList.filter((a, i) => i < 3).length) {
                  console.log(baseInfo);
                  resolve(baseInfo)
                }
              }, error => {
                console.log(error);
                reject(error);
              })
            }, idx * 1200);
          })
        }
      })
  })
}

const fetchStockInfo = (stockInfo) => {
  return new Promise((resolve, reject) => {
    superagent
      .get(`https://goodinfo.tw/StockInfo/StockFinDetail.asp?RPT_CAT=IS_M_QUAR_ACC&STOCK_ID=${stockInfo.code}`)
      .set({ 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36' })
      .end((err2, res2) => {
        if (err2) {
          reject(`抓取 ${stockInfo.code} 失敗 - ${err2}`);
          return;
        } else {
          console.log(`get stock ${stockInfo.code} success`);
          baseInfo.push(getBaseInfo(res2, stockInfo));
          resolve();
        }
      });
  })
}

const writeFirebaseDB = (data) => {
  return new Promise((resolve, reject) => {
    db.collection('stocks')
      .doc(today)
      .set({ data })
      .then(() => {
        console.log('write database success!');
        resolve();
      })
      .catch(error => reject(error))
  })
}

app.get('/', async (req, res, next) => {
  getNeedData().then((data) => {
    writeFirebaseDB(data);
    res.send(data);
  }, (error) => {
    res.send(error);
  })
});