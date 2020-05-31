# Get Someecards Meme Ecard Links By Category and Month
Scrape a list of meme ecard URLs from the Someecards.com website. Built with Node.js and Puppeteer.

## How to use
To run, type:

```JavaScript
node index.js
```

By default, this will collect all ecard URLs and save to ecard-links.json. 

You can include/exclude categories from the output file, using an optional configuration file. Start by copying config-sample.json to config.json. 

There are two ways to limit categories, a whitelist or a blacklist. Using a whitelist will include only the chosen categories. Using a blacklist will include all categories except the chosen ones. 

In config.json, add category slugs to the "whitelist.categories" or "blacklist.categories" array. __If there are items in both, only the whitelist will be used.__