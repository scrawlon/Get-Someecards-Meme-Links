const fs = require('fs');

const puppeteer = require('puppeteer');

const config = require('./config.json');
const baseUrl = 'https://www.someecards.com/'; 
const linkSelector = '.card > a';

async function loadAllCardElements(page) {
	let preCount = 0;
	let postCount = 0;

	do {
		preCount = await page.$$eval(linkSelector, elements => elements.length);
		await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
		await page.waitFor(500);
		await page.waitForSelector(linkSelector, { visible: true });
		postCount = await page.$$eval(linkSelector, elements => elements.length);
	} while ( postCount > preCount );

	console.log(`preCount: ${preCount}, postCount: ${postCount}`);

	return Promise.resolve();
}

async function getAllLinks(page) {
	return await page.$$eval(linkSelector, (cardLinkElements, baseUrl) => {
		let allCardLinks = [];
			
		for ( const link of cardLinkElements ) {
			const urlPath = link.href.replace(baseUrl, ''); 
			
			allCardLinks.push(urlPath);
		}

		return Promise.resolve(allCardLinks);
	}, baseUrl);
}

(async () => {
  const browser = await puppeteer.launch();
	const page = await browser.newPage();

	/* Improve script speed by not loading visual resources */
	await page.setRequestInterception(true);
  page.on('request', (req) => {
		const visualElements = ['image', 'stylesheet', 'font'];

		if ( visualElements.includes(req.resourceType()) ) {
			req.abort();
    } else {
			req.continue();
    }
	});

	/* Load Someecard categories from window.__APP_STATE__ JavaScript variable */ 
  await page.goto( `${baseUrl}card/categories/`);
	const seAppState = await page.evaluate(() => window.__APP_STATE__);
	const { allCardCategories: { allCardCategories: { categories, eventsByMonth } } } = seAppState;

	if ( ! categories || ! eventsByMonth ) process.exit(1);
	
	/* Load config.json options */
	const { 
		whitelist: { categories: categoriesWhitelist = [] } = {},
		blacklist: { categories: categoriesBlacklist = [] } = {}
	} = config;

	const useWhitelist = categoriesWhitelist.length > 0;
	const useBlacklist = ! useWhitelist && categoriesBlacklist.length > 0; 
	const includeAll = ! useWhitelist && ! useBlacklist;
	
	let seCardLinks = {
		baseUrl,
		categories: {},
		eventsByMonth: {}
	};

  for ( const category of categories ) {
		const whitelistAllowed = useWhitelist && categoriesWhitelist.includes(category.slug);
		const blacklistAllowed = useBlacklist && ! categoriesBlacklist.includes(category.slug); 

		if ( includeAll || ( whitelistAllowed || blacklistAllowed ) ) {
			console.log(category.canonicalUrl);
			await page.goto(category.canonicalUrl, { waitUntil: 'networkidle0' });
			await loadAllCardElements(page);
			const links = await getAllLinks(page);

			console.log(links);
			
			seCardLinks.categories[category.slug] = links;
    }
	}

	fs.writeFileSync('./ecard-links.json', JSON.stringify(seCardLinks));

  await browser.close();
})();