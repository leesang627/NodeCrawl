const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');
const puppeteer = require('puppeteer');

const db = require('./models');

dotenv.config();

const crawler = async () => {
  await db.sequelize.sync();
  try{
    let browser = await puppeteer.launch({headless: false, args: ['--window-size=1920,1080','--disable-notifications']});
    let page = await browser.newPage();
    await page.setViewport({
      width: 1080,
      height: 1080,
    });
    await page.goto('http://spys.one/free-proxy-list/KR/');
    const proxies = await page.evaluate(() => {
      const ips = Array.from(document.querySelectorAll('tr > td:first-of-type > .spy14')).map(v => {
        return v.textContent.replace(/document\.write\(.+\)/,'');
      });
      const latencies = Array.from(document.querySelectorAll('tr > td:nth-of-type(6) .spy1')).map(v => v.textContent);
      const types = Array.from(document.querySelectorAll('tr > td:nth-of-type(2)')).slice(4,34).map(v => v.textContent);
      return ips.map((v,i) => {
        return {
          ip: v,
          type: types[i],
          latency: latencies[i],
        };
      });
    });
    const proxyList = proxies.filter(v => v.type.startsWith('HTTPS')).sort((p,c) => p.latency-c.latency);
    console.log(proxyList);
    await page.close();
    await browser.close();
    browser = await puppeteer.launch({
      headless: false,
      args: ['--window-size=1920,1080','--diable-notifications',`--proxy-server=${proxyList[0].ip}`],
    });
    page = await browser.newPage();
  } catch (e) {
    console.error(e);
  }
};

crawler();