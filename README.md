## Market Scraper

This is an app that allows users to enter in any search query and get notified when any new listings show up in
craigslist for that search. 

The motivation behind this app was that craigslist didn't have a mobile app where you can seamlessly check 
and refresh for new listings that you're interested in. With that said, I decided to use web automation with
Puppeteer and Node.js to scrape for listings in craigslist for this project.

### Before running the app

1. Go into the index.js file and set your own `search` and `price`. (I set it to search for gaming PCs under $800) 
```javascript
const search = 'gaming pc';
const price = 800;
```

2. In the `sendNotification` function, set the mail service of your choice and enter the username and password of
the email address that you want to send the notification.
```javascript
let transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'your username here',
		pass: 'your password here'
	}
});
```

3. Set `from` to the above email and set `to` to the email address that you want to get notified with.
```javascript
let info = await transporter.sendMail({
	from: '"New Listings!" <user@gmail.com>',
	to: '',
	subject: 'Gaming PCs under $800',
	text: textBody
});
```

### Additional Notes

- Planning to implement with: Facebook Marketplace, OfferUp