const fs = require('fs');
const axios = require('axios');
const puppeteer = require('puppeteer');


const crawler = async () => {
  try{
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://unsplash.com');
    let result = [];
    while (result.length <= 100){
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
    await page.close();
    await browser.close();
  } catch (e) {
    console.error(e);
  }
};

crawler();