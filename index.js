const fs = require('fs');

const puppeteer = require('puppeteer');

const cliArgs = process.argv.slice(2);

let config = {}

try {
	config = require('./config.json');
	console.log(`Config file found. Running with selected options.`);
} catch {
	console.log(`Config file not found. Running with default options.`);
}

const baseUrl = 'https://www.someecards.com/'; 
const linkSelector = '.card > a';

async function ignoreVisualElements(page) {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
		const visualElements = ['image', 'stylesheet', 'font'];

		if ( visualElements.includes(req.resourceType()) ) {
			req.abort();
        } else {
            req.continue();
        }
	});

	return Promise.resolve();
}

async function loadAllCardElements(page) {
	let preCount = 0;
	let postCount = 0;

	do {
		preCount = await page.$$eval(linkSelector, elements => elements.length);
		await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
		await page.waitFor(500);

		try {
			await page.waitForSelector(linkSelector, { visible: true, timeout: 500 });
			postCount = await page.$$eval(linkSelector, elements => elements.length);
		} catch {
			return Promise.resolve();
		}
	} while ( postCount > preCount );

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

async function getCategoryLinks(page, categories) {
	let categoryLinks = {};

	/* Load config.json options */
	const { 
		whitelist: { categories: categoriesWhitelist = [] } = {},
		blacklist: { categories: categoriesBlacklist = [] } = {}
	} = config;

	const useWhitelist = categoriesWhitelist.length > 0;
	const useBlacklist = ! useWhitelist && categoriesBlacklist.length > 0; 
	const includeAll = ! useWhitelist && ! useBlacklist;

  for ( const category of categories ) {
		const whitelistAllowed = useWhitelist && categoriesWhitelist.includes(category.slug);
		const blacklistAllowed = useBlacklist && ! categoriesBlacklist.includes(category.slug); 

		if ( includeAll || ( whitelistAllowed || blacklistAllowed ) ) {
			await page.goto(category.canonicalUrl, { waitUntil: 'networkidle0' });
			await loadAllCardElements(page);
			const links = await getAllLinks(page);
			
			categoryLinks[category.slug] = links;

			console.log(`Category: ${category.name}, Total Links: ${links.length}`);
		}
	}

	return Promise.resolve(categoryLinks);
}

async function getEventsByMonthLinks(page, eventsByMonth) {
	const months = Object.entries(eventsByMonth);

	for ( const [key, val] of months ) {
		const { events } = val;
		let count = 0;

		for ( const event of events ) {
			await page.goto(`${baseUrl}memes/${event.slug}`, { waitUntil: 'networkidle0' });
			await loadAllCardElements(page);
			const links = await getAllLinks(page);
			
			eventsByMonth[key]['events'][count]['urls'] = links;
			count++;
			console.log(`Month: ${key}, Event: ${event.name}, Total Links: ${links.length}`);
		}
	}

	return Promise.resolve(eventsByMonth);
}

function processCliArgs(categories) {
	const [ option ] = cliArgs;

	switch ( option ) {
		case '-lcs':
			const categorySlugs = categories.map(category => category.slug);
			console.log(categorySlugs);
			break;
		default:
			console.log(`Unrecognized option, "${option}".`);
	}
}

(async () => {
    const browser = await puppeteer.launch();
	const page = await browser.newPage();

	/* Improve script speed by not loading visual resources */
	await ignoreVisualElements(page);

	/* Load Someecard categories from window.__APP_STATE__ JavaScript variable */ 
    await page.goto( `${baseUrl}card/categories/`);
	const seAppState = await page.evaluate(() => window.__APP_STATE__);
	const { allCardCategories: { allCardCategories: { categories, eventsByMonth } } } = seAppState;

	if ( ! categories || ! eventsByMonth ) {
		process.exit(1);
	} else if ( cliArgs.length ) {
		processCliArgs(categories);

		process.exit(1);
    }
    
	let seCardLinks = {
		baseUrl,
		categories: await getCategoryLinks(page, categories),
		eventsByMonth: await getEventsByMonthLinks(page, eventsByMonth)
	};
	
	fs.writeFileSync('./ecard-links.json', JSON.stringify(seCardLinks));

    await browser.close();
})();