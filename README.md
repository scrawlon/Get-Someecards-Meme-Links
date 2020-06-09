# Get Someecards Meme Ecard Links By Category and Month
Scrape a list of meme ecard URLs from the [Someecards.com](https://www.someecards.com/) website. Built with Node.js and [Puppeteer](https://github.com/puppeteer/puppeteer).

## Installation
Clone the repo and install dependencies:
```
git clone git@github.com:scrawlon/Get-Someecards-Meme-Links.git
```

```
cd Get-Someecards-Meme-Links
```

```
npm install
```

## How to use
To run, type:

```
npm run build
```

By default, this will collect all ecard URLs and save to './dist/ecard-links.json'. 

## Configuration options
You can include/exclude categories from the output file, using an optional configuration file. Start by copying config-sample.json to config.json. 

There are two ways to limit categories, a whitelist or a blacklist. Using a whitelist will include only the chosen categories. Using a blacklist will include all categories except the chosen ones. 

In config.json, add category slugs to the "whitelist.categories" or "blacklist.categories" array. __If there are items in both, only the whitelist will be used.__

__Whitelist example:__
```JavaScript
{
    "whitelist": {
        "categories": [
            "drinking",
            "420",
            "weekend"
        ]
    }
}
```

__Blacklist example:__
```JavaScript
{
    "blacklist": {
        "categories": [
            "mom",
            "seasonal",
            "animated-text"
        ]
    }
}
```

To see a list of available category slugs, type:

```
node index.js -lcs
```

Here's the current list, as of 5/31/20:

```
'420',
'affirmations',
'animated-text',
'anniversary',
'apology',
'baby',
'birthday',
'breakup',
'breast-cancer-awareness',
'college',
'confession',
'congratulations',
'courtesy-hello',
'cry-for-help',
'cute-therapy',
'chappelle-equanimity',
'divorce',
'drinking',
'ecard-museum',
'encouragement',
'espanol',
'facebook',
'family',
'fantasy-sports',
'farewell',
'father-figures',
'flirting',
'friendship',
'get-well',
'graduation',
'grumpy-week',
'holiday-parties',
'home-chef',
'international-postcards',
'intervention',
'lgbt',
'miss-you',
'mom',
'monday-punday',
'movie-misquotes',
'movies',
'news',
'parenting-tips',
'pets',
'pi-day',
'pregnancy',
'psas',
'ransom-cards',
'reminders',
'seasonal',
'showtime-smilf-shameless',
'soccer',
'some-inspiration',
'somewine',
'splenda',
'sports',
'sympathy',
'tv-land-teachers-s2b',
'thanks',
'thanksgivukkah',
'thinking-of-you',
'throwback-thursday',
'tv',
'us-postcards',
'weddings',
'weekend',
'wine',
'workplace'
```

