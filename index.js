const fs = require('fs');
const axios = require('axios');
const puppeteer = require('puppeteer');


const crawler = async () => {
  try{
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://unsplash.com');
    const result = await page.evaluate(() => {
      let imgs = [];
      const imgEls = document.querySelectorAll('._1Nk0C img._2zEKz')
      if (imgEls.length) {
        imgEls.forEach((v) => {
          if(v.src) {
            imgs.push(v.src);
          }
        });
      }
      return imgs;
    });
    console.log(result);
  } catch (e) {
    console.error(e);
  }
};

crawler();