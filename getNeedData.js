import cheerio from 'cheerio';

export const getListedCompanyInfoList = (res) => {
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

export const getBaseInfo = (res, stockInfo) => {
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