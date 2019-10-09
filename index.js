const dotenv = require('dotenv');
const puppeteer = require('puppeteer');

const db = require('./models');
dotenv.config();

const crawler = async () => {
  try{
    await db.sequelize.sync();
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        '--window-size=1920,1080',
        '--disable-notifications',
      ],
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1080,
      height: 1080,
    });
    await page.goto('https://facebook.com');
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;
    await page.type('#email', email);
    await page.type('#pass', password);
    await page.waitFor(1000);
    await page.click('#loginbutton');

    await page.waitForSelector('[id^=hyperfeed_story_id]:first-child');
    const newPost = await page.evaluate(() => {
      const firstFeed = document.querySelector('[id^=hyperfeed_story_id]:first-child');
      const name = firstFeed.querySelector('.fwb.fcg') && firstFeed.querySelector('.fwb.fcg').textContent;
      const content = firstFeed.querySelector('.userContent') && firstFeed.querySelector('.userContent').textContent;
      const postId = firstFeed.id.split('_').slice(-1)[0];
      return {
        name,
        content,
        postId,
      }
    });
    console.log(newPost);
  } catch (e) {
    console.error(e);
  }
};

crawler();