const puppeteer = require('puppeteer');
const readline = require('readline');
const https = require('https');
const axios = require('axios');
const { randomInt } = require('crypto');

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// rl.question("GameID (Steam):\n", (gameid) => {
//     GetSteam(gameid);
// });

async function GetSteam(gameid) {
    let prices = [0];
    let url = `https://store.steampowered.com/api/appdetails/?appids=${gameid}&filters=price_overview`;
    console.log(`Composed URL: ${url}`);
    let i = 0;
    await axios.get(url).then((res) => {
        let result = res.data;
        let priceInfo = result[`${gameid}`]["data"]["price_overview"];
        if (priceInfo != undefined){
            let price = priceInfo.final/100;
            prices[i] = price;
        } else {
            prices[i] = 0.00;
        }
        i++;
    },(error) => {
        console.log(error);
    });
    return prices;
}


// rl.on("line", () => {
//     rl.close();
// });

async function GetEpic(gameTitle) {
    const browser = await puppeteer.launch({headless: false, args: [`--window-size=1280,720`], defaultViewport: {width: 1280, height: 720}});
    const page = await browser.newPage();

    const lowercase = gameTitle.toLowerCase();
    const url = lowercase.replace(" ", "-");

    await page.goto(`https://store.epicgames.com/en-US/p/${url}`);
    
    await page.click('button#month_toggle');
    let rand_1 = randomInt(1, 12);
    let selectorString1 = 'li.css-1vf7hpq';
    for (let j = 0; j < rand_1; j++) {
        selectorString1 += ' + li.css-1vf7hpq';
    }
    selectorString1 += ' > button.css-mzqr3o';
    await page.click(selectorString1);
    await page.click('button#day_toggle');
    let rand_2 = randomInt(1, 25);
    let selectorString2 = 'li.css-1vf7hpq';
    for (let j = 0; j < rand_2; j++) {
        selectorString2 += ' + li.css-1vf7hpq';
    }
    selectorString2 += ' > button.css-mzqr3o';
    await page.click(selectorString2);
    await page.click('button#year_toggle');
    let rand_3 = randomInt(18, 30);
    let selectorString3 = 'li.css-1vf7hpq';
    for (let j = 0; j < rand_3; j++) {
        selectorString3 += ' + li.css-1vf7hpq';
    }
    selectorString3 += ' > button.css-mzqr3o';
    await page.click(selectorString3);
    await page.click('button.eds_14hl3lj9.eds_14hl3ljb');
    
    const price = await page.evaluate(() => {
        const element = document.querySelector('div.css-169q7x3 > div > div > div > div > span > strong');
        const text = element.innerText;
        if (text == "<span>Free</span>") return 0.00;
        return parseFloat(text.substring(3));
    });
    await page.screenshot({path: "./EpicGames.png"});
    console.log(`Game price: ${price}`);
    await browser.close();
    return price;
}

// setTimeout(() => {
//     getEpic("Rocket League");
// }, 6000);

async function GetXbox(gameTitle) {
    const browser = await puppeteer.launch({headless: false, args: [`--window-size=1280,720`], defaultViewport: {width: 1280, height: 720}});
    const page = await browser.newPage();
    let parsedPrice = 0;

    await page.goto("https://www.xbox.com/en-CA/");
    
    await page.click("button#search");
    await page.type("input#cli_shellHeaderSearchInput", gameTitle, {delay: 300});

    await page.click('a[aria-posinset="1"]');
    let mainPrice;

    await page.waitForSelector("span.Price-module__boldText___1i2Li.Price-module__moreText___sNMVr.AcquisitionButtons-module__listedPrice___PS6Zm", { timeout: 2500 });
    mainPrice = await page.evaluate(async() => {
        return document.querySelector("span.Price-module__boldText___1i2Li.Price-module__moreText___sNMVr.AcquisitionButtons-module__listedPrice___PS6Zm").innerText;
    });
    await page.screenshot({path: "./Xbox.png"});
    await browser.close();
    parsedPrice = parseFloat((mainPrice.substring(5)+"0"));

    return parsedPrice;
}

// getXbox("Minecraft");

async function GetPlayStation(gameTitle) {
    const browser = await puppeteer.launch({headless: false, args: [`--window-size=1280,720`], defaultViewport: {width: 1280, height: 720}});
    const page = await browser.newPage();

    await page.goto("https://store.playstation.com/en-ca/");

    setTimeout(async () => {
        await page.click(".shared-nav-search");
        await page.type(".search-text-box__input", gameTitle, {delay: 500});
        await page.click(".jetstream-search__search-button");

        setTimeout(async () => {
                const data = await page.evaluate(() => {
                let prices = [];
                let titles = [];

                const priceElements = document.querySelectorAll(".psw-m-r-3");
                const titleElements = document.querySelectorAll("#product-name");
                for (let i = 0; i < 6; i++) {
                    prices.push(priceElements[i].innerText);
                    titles.push(titleElements[i].innerText);
                }
                let data = {
                    "Result 1": {"Title": titles[0], "Price": prices[0]},
                    "Result 2": {"Title": titles[1], "Price": prices[1]},
                    "Result 3": {"Title": titles[2], "Price": prices[2]},
                    "Result 4": {"Title": titles[3], "Price": prices[3]},
                    "Result 5": {"Title": titles[4], "Price": prices[4]},
                    "Result 6": {"Title": titles[5], "Price": prices[5]}
                };
                
                return data;
            });
            console.log(data);
            await page.screenshot({path: "./Scraper Scripts/PlayStation.png"});
            await browser.close();
        }, 3000);
        
    }, 1500);
}

// getPlayStation("God Of War");

async function GetNintendo(gameTitle) {
    const browser = await puppeteer.launch({headless: false, args: [`--window-size=1280,720`], defaultViewport: {width: 1280, height: 720}})
    const page = await browser.newPage();

    await page.goto("https://www.nintendo.com/us/store/games/");

    setTimeout(async() => {
        await page.click(".K5to0.sc-iz67m1-3.dvnNEf")
        await page.click("#search");
        setTimeout(async()=>{
            await page.type(".sc-ax1lsj-1.fvPwkD.sc-1r59ztq-5.fmtMqf", gameTitle, {delay: 300});
            setTimeout(async() => {
                await page.click("._0lnrF.sc-ngspk1-6.boIOEb");
                setTimeout(async() => {
                        const data = await page.evaluate(() => {
                        let prices = [];
                        let titles = [];

                        const priceElements = document.querySelectorAll(".W990N.SH2al");
                        const titleElements = document.querySelectorAll(".s954l.qIo1e._39p7O.bC4e6");
                        for (let i = 0; i < 4; i++) {
                            prices.push(priceElements[i].innerText.substring(15));
                            titles.push(titleElements[i].innerText);
                        }

                        return {
                            "Result 1": {"Title": titles[0], "Price": prices[0]},
                            "Result 2": {"Title": titles[1], "Price": prices[1]},
                            "Result 3": {"Title": titles[2], "Price": prices[2]},
                            "Result 4": {"Title": titles[3], "Price": prices[3]}
                        }
                    });
                    console.log(data);
                    await browser.close();
                }, 1000);
            }, 2500);
        }, 1500);
    }, 1000);
}

// GetNintendo("Mario Kart 8");

// ----------   TESTS   ----------

// Test Steam
async function TestSteam() {
    let steamIDs = ["304390", "2507950", "1240440"];
    let realPrices = [39.99, 0.00, 0.00];
    // First tests the price of For Honor (39.99), then the price of Delta Force (free), and then the price of Halo Infinite (free, but has paid DLC)
    for (let i = 0; i < steamIDs.length; i++) {
        let results = await GetSteam(steamIDs[i]);
        console.log(`${results} == ${realPrices[i]}: ${results == realPrices[i]}`);
        console.log(`Full results array: ${results}`);
    }
}
await TestSteam();

// Test Epic Games:
async function TestEpic() {
    let gameTitles = ["Satisfactory"];
    let realPrices = [51.99];
    // First tests the price of Satisfactory (51.99), then the price of __ (__), and then the price of __ (__)
    for (let i = 0; i < gameTitles.length; i++) {
        let results = await GetEpic(gameTitles[i]);
        console.log(`${results} == ${realPrices[i]}: ${results == realPrices[i]}`);
    }
}
await TestEpic();

// Test Xbox:
async function TestXbox() {
    let gameTitles = ["Minecraft"];
    let realPrices = [25.99];
    // First tests the price of Minecraft (25.99), then the price of __ (__), and then the price of __ (__)
    for (let i = 0; i < gameTitles.length; i++) {
        let results = await GetXbox(gameTitles[i]);
        console.log(`${results} == ${realPrices[i]}: ${results == realPrices[i]}`);
    }
}
await TestXbox();