const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');
const puppeteer = require('puppeteer');

dotenv.config();

const crawler = async () => {
  try{
    const browser = await puppeteer.launch({headless: false, args: ['--window-size=1920,1080']});
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
    })
    await page.goto('https://www.facebook.com');
    const id = process.env.EMAIL;
    const password = process.env.PASSWORD;
    /*await page.evaluate((id, password) => {
      document.querySelector('#email').value = id;
      document.querySelector('#pass').value = password;
      document.querySelector('#loginbutton').click();
    }, id, password);*/
    await page.type('#email', process.env.EMAIL,{delay: 50});
    await page.type('#pass', process.env.PASSWORD,{delay: 50});
    await page.hover('#loginbutton');
    await page.waitFor(2000);
    await page.click('#loginbutton');
    await page.waitFor(10000);
    await page.keyboard.press('Escape');

  } catch (e) {
    console.error(e);
  }
};

crawler();