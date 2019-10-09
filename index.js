const dotenv = require('dotenv');
const puppeteer = require('puppeteer');

const db = require('./models');
dotenv.config();

const crawler = async () => {
  await db.sequelize.sync();
  try{

  } catch (e) {
    console.error(e);
  }
};

crawler();