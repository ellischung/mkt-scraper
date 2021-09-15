const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');

async function getListings() {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    // link to search results
    const url = 'https://newyork.craigslist.org/d/for-sale/search/sss?max_price=500&query=gaming%20pc&sort=rel';

    await page.goto(url);

    await page.waitForSelector('.result-row');

    // return the URLs for the listings
    const results = await page.$$eval('.result-row', rows => {
        return rows.map(row => {
            const properties = {};
            const titleElement = row.querySelector('.result-title');
            //properties.title = titleElement.innerText;
            //const priceElement = row.querySelector('.result-price');
            //properties.price = priceElement ? priceElement.innerText : '';
            properties.url = titleElement.getAttribute('href');
            return properties;
        });
    });

    // close first browser
    browser.close();

    await Promise.all(results.slice(0,5).map(async result => {
        getListingInfo(result.url);
    }));

    //sendNotification(results.slice(0,5));
}

async function getListingInfo(url) {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.goto(url);

    // holds all important information from the listing
    const properties = {};

    properties.url = url;

    // description text from the listing
    properties.info = await page.evaluate(() => {
        let el = '';
        let i = 2;
        while(document.getElementById('postingbody').childNodes[i] != null) {
            el += document.getElementById('postingbody').childNodes[i].textContent;
            i++;
        }
        return el;
    })

    console.log(properties.info + '\n' + '------------------------');

    browser.close();
}

async function startScraping() {
    let job = new CronJob('* */30 * * * *', function() {
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

    let textBody = 'Craigslist Gaming PCs\n\n';
    
    listings.map(listing => {
        textBody += JSON.stringify(listing.title) + '\n';
        textBody += JSON.stringify(listing.price) + '\n'; 
        textBody += JSON.stringify(listing.url) + '\n\n\n'; 
    });

    let info = await transporter.sendMail({
        from: '"New Listings!" ',
        to: '',
        subject: 'Gaming PCs',
        text: textBody
    });

    console.log('Email sent: %s', info.messageId);
}

startScraping();