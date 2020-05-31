# Get Someecards Meme Ecard Links By Category and Month
Scrape a list of meme ecard URLs from the Someecards.com website. Built with Node.js and Puppeteer.

## How to use
To run with default options:

```JavaScript
node index.js
```

This will collect all ecard URLs and save to ecard-links.json. 

To include/exclude categories, you can add an optional configuration file. Copy config-sample.json to config.json. 

There are two ways to limit categories, a whitelist or a blacklist. Using the whitelist will include only the chosen categories. Using the blacklist will include all categories except the chosen ones.

In config.json, add category slugs to the "whitelist.categories" __or__ "blacklist.categories" array. If there are items in both, only the whitelist will be used.