const parse = require('csv-parse/lib/sync');
const stringify = require('csv-stringify/lib/sync');
const fs = require('fs');
const axios = require('axios');
const puppeteer = require('puppeteer');

const csv = fs.readFileSync('csv/data.csv');
const records = parse(csv.toString('utf-8'));

fs.readdir('poster',(err) => {
  if(err){
    console.error('포스터 폴더가 없어 포스트 폴더 생성');
    fs.mkdirSync('poster');
  }
});

fs.readdir('screenshot',(err) => {
  if(err){
    console.error('스크린샷 폴더가 없어 스크린샷 폴더 생성');
    fs.mkdirSync('screenshot');
  }
});

const crawler = async () => {
  try{
    const result = [];
    const browser = await puppeteer.launch({
      headless: process.env.NODE_ENV === 'production',
      args: ['--window-size=1920,1080'],
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
    });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36');
    for (const [ i, r ] of records.entries()){
      await page.goto(r[1]);
      const data = await page.evaluate(() => {
        const scoreEl = document.querySelector('.score.score_left .star_score');
        let score = '';
        if(scoreEl) {
          score = scoreEl.textContent;
        }
        const imgEl = document.querySelector('.poster img');
        let img = '';
        if(imgEl) {
          img = imgEl.src;
        }
        return {
          score,
          img,
        };
      });
      if(data.score) {
        console.log(r[0],'평점',data.score.trim());
        result[i] = [r[0],r[1],data.score.trim()];
      }
      if(data.img) {
        await page.screenshot({
          path: `screenshot/${r[0]}.jpg`,
          clip: {
            x: 100,
            y: 100,
            width: 300,
            height: 300,
          },
        });
        const imgData = await axios.get(data.img.replace(/\?.*$/, ''), {
          responseType: "arraybuffer",
        });
        fs.writeFileSync(`poster/${r[0]}.jpg`, imgData.data);
      }
      await page.waitFor(1000);
    }
    await page.close();
    const str = stringify(result);
    fs.writeFileSync('csv/result.csv', str);
    await browser.close();
  } catch (e) {
    console.error(e);
  }
};

crawler();