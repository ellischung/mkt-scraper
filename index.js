const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');

async function getListings() {
    // array to hold information for each of the listings
    const listings = [];
    
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
            properties.url = titleElement.getAttribute('href');
            return properties;
        });
    });

    // close first browser
    browser.close();

    // get the information from the first 5 listings and add them to the array
    await Promise.all(results.slice(0,5).map(async result => {
        const listing = await getListingInfo(result.url);
        listings.push(listing);
    }));

    // send notification for new listings via email
    sendNotification(listings);
}

async function getListingInfo(url) {
    // holds all important information from the listing
    const listing = {};

    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.goto(url);

    // title of listing
    listing.title = await page.evaluate(() => {
        const el = document.getElementById('titletextonly');
        return el.textContent;
    });

    // price of listing
    const priceElement = await page.waitForSelector('.price'); 
    listing.price = await priceElement.evaluate(el => el.textContent);

    // url of listing
    listing.url = url;

    // description text from the listing
    listing.info = await page.evaluate(() => {
        let el = '';
        let i = 2;
        while(document.getElementById('postingbody').childNodes[i] != null) {
            el += document.getElementById('postingbody').childNodes[i].textContent;
            i++;
        };
        return el;
    });
    
    // close second browser
    browser.close();

    return listing;
}

async function startScraping() {
    let job = new CronJob('* */30 * * * *', function() { // executes every 30 minutes
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

    const craigslist = "---------------Craigslist Gaming PCs---------------";
    //const facebook = "----------Facebook Marketplace Gaming PCs----------";
    //const offerup = "-----------------OfferUp Gaming PCs-----------------";

    let textBody = craigslist + '\n\n';
    
    listings.map(listing => {
        textBody += JSON.stringify(listing.title) + '\n';
        textBody += JSON.stringify(listing.price) + '\n'; 
        textBody += JSON.stringify(listing.url) + '\n'; 
        const info = JSON.stringify(listing.info).split('\\n');
        info.map(line => {
            textBody += line + '\n';
        });
        textBody += '----------------------------------------------------\n\n\n'; 
    });

    let info = await transporter.sendMail({
        from: '"New Listings!"',
        to: '',
        subject: 'Gaming PCs',
        text: textBody
    });

    console.log('Email sent: %s', info.messageId);
}

startScraping();