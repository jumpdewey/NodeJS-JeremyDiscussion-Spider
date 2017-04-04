const cheerio = require('cheerio');
const superagent = require('superagent');
const yargs = require('yargs');
const argv = yargs
  .options({
    y:{
      alias:'year',
      demand:true,
      describe:'year to fetch data(YYYY)',
      string:true
    },
    m:{
      alias:'month',
      demand:true,
      describe:'month to fetch data(MM)',
      string:true
    },
    d:{
      alias:'date',
      demand:true,
      describe:'date to fetch data(DD)',
      string:true
    }
  }).help()
    .argv;
var year = argv.year;
var month = argv.month;
var day = argv.date;
var urls = {
  TargetUrl : 'https://neu.mywconline.net',
  // LoginUrl : 'https://neu.mywconline.net/schedule.php?date=03-12-2017&scheduleid=sc583de62f63759'
}
const base_headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
  'Content-Type' : 'application/x-www-form-urlencoded',
  Accept:'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Encoding':'gzip, deflate, br',
  'Accept-Language':'en,zh;q=0.8,zh-CN;q=0.6',
  'Cache-Control':'max-age=0',
  Connection:'keep-alive',
  // 'Content-Length':contents.length,
  Host:'neu.mywconline.net',
  Origin:'https://neu.mywconline.net',
  Referer:'https://neu.mywconline.net/index.php?msgLOG=YES',
  'Upgrade-Insecure-Requests':1
}

var privateMsg = {
  email : 'xxx',
  password : 'xxx',
  scheduleid : 'xxx',
  login : 'Log In',
  resume:''
}

let cookie;
function getMainPage() {
  return new Promise((resolve, reject) => {
    superagent
      .get(urls.TargetUrl)
      .end((err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
  });
}

function login(data) {
  cookie = data.headers['set-cookie'].join().match(/(PHPSESSID=.+?);/)[1];
  // console.log(cookie);
  return new Promise((resolve, reject) => {
    superagent
      .post(urls.TargetUrl)
      .set(base_headers)
      .set("Cookie", cookie)
      .send(privateMsg)
      .type('form')
      .end((err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
  });
}


function getTargetPage() {
  // var year = date.getFullYear();
  // var month = date.getMonth()+1;
  // var day = date.getDate();
  // if (month < 10) {
  //   month = '0' + month;
  // }
  // if (day < 10) {
  //   day = '0' + day;
  // }

  var loginUrl = `https://neu.mywconline.net/schedule.php?date=${month}-${day}-${year}&scheduleid=sc583de62f63759`;
  console.log(loginUrl);
  return new Promise((resolve, reject) => {
    superagent
      .get(loginUrl)
      .set("Cookie", cookie)
      .set(base_headers)
      .end((err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
  });
}

getMainPage()
  .then(login)
  .then(getTargetPage)
  .then(data => {
    var $ = cheerio.load(data.text);
    // var day = date.getDay();
    var str = `${year}/${month}/${day}`;
    var temp = new Date(str);
    var num = temp.getDay();
    // console.log('day :' + num);
    var magicNum;
    switch (num) {
      case 1:
      case 2:
      case 0:
        magicNum = 2;
        break;
      case 3:
        magicNum = 1;
        break;
      case 4:
      case 5:
        magicNum = 6;
        break;
      case 6:
        magicNum = 4;
    }
    var title = $("td:contains('Allows 4 member groups')").eq(magicNum);
    if (title.text().includes('Jeremy')) {
      var targetTd = title.next().next();
      var click = targetTd.attr('onclick');
      console.log(title.text().trim());
      if (click) {
        console.log('it has positions now!');
      } else {
        console.log('No positions!');
      }
    } else {
      console.log("I can't find Jeremy's Discussion! : (");
    }
  })
  .catch((err) => {console.log('Error is :' + err);});
