const fs = require('fs');
const axios = require('axios');
const puppeteer = require('puppeteer');

fs.readdir('imgs', (err) => {
  if(err) {
    console.error('imgs 폴더가 없어 새로 생성합니다.');
    fs.mkdirSync('imgs');
  }
})

const crawler = async () => {
  try{
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://unsplash.com');
    let result = [];
    while (result.length <= 10){
      const srcs = await page.evaluate(() => {
        window.scrollTo(0,0);
        let imgs = [];
        const imgEls = document.querySelectorAll('._1Nk0C');
        if (imgEls.length) {
          imgEls.forEach((v) => {
            let src = v.querySelector('img._2zEKz').src;
            if(src) {
              imgs.push(src);
            }
            v.parentElement.removeChild(v);
          });
        }
        window.scrollBy(0,300);
        return imgs;
      });
      result = result.concat(srcs);
      await page.waitForSelector('._1Nk0C');
      console.log('로딩 완료');
    }
    console.log(result);
    result.forEach( async (src) => {
      const imgResult = await axios.get(src.replace(/\?.*$/, ''), {
        responseType: 'arraybuffer',
      });
      fs.writeFileSync(`imgs/${new Date().valueOf()}.jpeg`, imgResult.data);
    });
    await page.close();
    await browser.close();
  } catch (e) {
    console.error(e);
  }
};

crawler();