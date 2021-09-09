const puppeteer = require('puppeteer');

async function getListings() {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    const url = 'https://newyork.craigslist.org/d/for-sale/search/sss?max_price=60&query=ssd&sort=rel';

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

    console.log(results);

    browser.close();
}

getListings();