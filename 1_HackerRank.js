// command to run code=node 1_HackerRank.js --url=https://www.hackerrank.com --config=config.json 
// we need to install puppeteer liabrary which gives permission to control chrome or chromium browser(we can say it dummy browser
//we have made config.json file manually which contains our  credentials like usrid,password,moderator 

// npm install minimist
// npm install puppeteer 

let minimist = require("minimist");
let puppeteer = require("puppeteer");
let fs = require("fs");

let args = minimist(process.argv);
//we read the json file
let configJSON = fs.readFileSync(args.config, "utf-8");
let configJSO = JSON.parse(configJSON);

async function rookie() {
    // start the browser
    let browser = await puppeteer.launch({
        headless: false,
        args: [                                       //isse window puri khulti hai
            '--start-maximized'
        ],
        defaultViewport: null                         //and isse jo page/content hoga vo fullscreen visible hoga 
    });

    // get the tabs (there is only one tab)
    let pages = await browser.pages();
    let page = pages[0];

    // open the url
    await page.goto(args.url);

    // wait and then click on login on page1
    await page.waitForSelector("a[data-event-action='Login']");
    await page.click("a[data-event-action='Login']");

    // wait and then click on login on page2
    await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
    await page.click("a[href='https://www.hackerrank.com/login']");

    // type userid
    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']", configJSO.userid, { delay: 20 });

    // type password
    await page.waitForSelector("input[name='password']");
    await page.type("input[name='password']", configJSO.password, { delay: 20 });

    // press click on login tab
    await page.waitFor(3000)

    await page.waitForSelector("button[data-analytics='LoginPassword']");
    await page.click("button[data-analytics='LoginPassword']");

    // click on compete
    await page.waitForSelector("a[data-analytics='NavBarContests']");
    await page.click("a[data-analytics='NavBarContests']");

    // click on manage contests
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");

    await page.waitForSelector("a[data-attr1='Last']");
    let numberOfPages = await page.$eval("a[data-attr1='Last']", function(alast){
        let countOfPages = parseInt(alast.getAttribute("data-page"));
        return countOfPages;
    })

    for(let i = 0; i < numberOfPages - 1; i++){
        await page.waitForSelector("a.backbone.block-center");
        let contestUrls = await page.$$eval("a.backbone.block-center", function(atags){   ////agar hame kisi cheej(anythung) k ander se value nikalni hai to $$eval use karna padta hai ($$eval is equal to document.querySelectorAll)
            let urls = [];
    
            for(let i = 0; i < atags.length; i++){
                let url = atags[i].getAttribute('href');
                urls.push(url);
            }
    
            return urls;
        });
    
        for (let i = 0; i < contestUrls.length; i++) {
            let cpage = await browser.newPage();
    
            await saveModerator(args.url + contestUrls[i], cpage, configJSO.moderator);
    
            await cpage.close();
        }

        await page.waitForSelector("a[data-attr1='Right']");
        await page.click("a[data-attr1='Right']");
    }
}

async function saveModerator(url, cpage, moderator) {
    await cpage.bringToFront();
    await cpage.goto(url);

    await cpage.waitFor(3000);

    // click on moderators tab
    await cpage.waitForSelector("li[data-tab='moderators']");
    await cpage.click("li[data-tab='moderators']");

    // type  moderator
    await cpage.waitForSelector("input#moderator");
    await cpage.type("input#moderator", moderator, { delay: 20 });
//save moderator /clicks on add button
    await cpage.keyboard.press("Enter");
}

rookie();


