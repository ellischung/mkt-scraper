const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');

async function getListings() {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    const url = 'https://newyork.craigslist.org/d/for-sale/search/sss?max_price=500&query=gaming%20pc&sort=rel';

    await page.goto(url);

    await page.waitForSelector('.result-row');

    const results = await page.$$eval('.result-row', rows => {
        return rows.map(row => {
            const properties = {};
            const titleElement = row.querySelector('.result-title');
            properties.title = titleElement.innerText;
            properties.url = titleElement.getAttribute('href');
            const priceElement = row.querySelector('.result-price');
            properties.price = priceElement ? priceElement.innerText : '';
            const imageElement = row.querySelector('.swipe [data-index="0"] img');
            properties.imageUrl = imageElement ? imageElement.src : '';
            const dateElement = row.querySelector('.result-date');
            properties.date = dateElement.innerText;
            return properties;
        });
    })

    sendNotification(results.slice(0,5));

    browser.close();
}

async function startScraping() {
    let job = new CronJob('*/15 * * * * *', function() {
        getListings();
    }, null, true, null, null, true);
    job.start();
}

async function sendNotification(listings) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: '',
            pass: ''
        }
    });

    let textBody = listings.toString();

    let info = await transporter.sendMail({
        from: '"New gaming pc listings" <fordevemailacc@gmail.com>',
        to: '',
        subject: 'Craigslist Gaming PCs',
        text: textBody
    });

    console.log('Email sent: %s', info.messageId);
}

startScraping();