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
      const img = firstFeed.querySelector('[class=mtm] img') && firstFeed.querySelector('[class=mtm] img').src;
      const postId = firstFeed.id.split('_').slice(-1)[0];
      return {
        name,
        img,
        content,
        postId,
      }
    });
    await page.waitFor(5000);
    const likeBtn = await page.$('[id^=hyperfeed_story_id]:first-child ._666k a');
    await page.evaluate((like) => {
      const sponsor = document.querySelector('[id^=hyperfeed_story_id]:first-child').textContent.includes('Sponsored');
      if(!sponsor && like.getAttribute('aria-pressed') === 'false'){
        like.click();
      } else if (sponsor && like.getAttribute('aria-pressed') === 'true'){
        like.click();
      }
    }, likeBtn);
    await page.waitFor(5000);
    await page.evaluate(() => {
      const firstFeed = document.querySelector('[id^=hyperfeed_story_id]:first-child');
      firstFeed.parentNode.removeChild(firstFeed);
    });
    await page.waitFor(5000);
    console.log(newPost);
  } catch (e) {
    console.error(e);
  }
};

crawler();