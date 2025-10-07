const puppeteer = require('puppeteer');
const readline = require('readline');
const https = require('https');

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// rl.question("GameID (Steam):\n", (gameid) => {
//     for (i = 0; i < gameid.length; i++) {
//         console.log(`char @ ${i}: ${gameid[i]}`);
//     }
//     let url = `https://store.steampowered.com/api/appdetails/?appids=${gameid}&filters=price_overview`;
//     console.log(`Composed URL: ${url}`);
    // https.get(url, (res) => {
    //     res.forEach((data) => {
    //         let parsed = JSON.parse(data);
    //         // let key = Object.keys(parsed);
    //         // console.log(`GameID: ${key[0]}`);
    //         let priceInfo = parsed[`${gameid}`]["data"]["price_overview"];
    //         console.log(`
    //             Prices are in ${priceInfo.currency}
    //             Initial price: ${priceInfo.initial_formatted}
    //             Discount: ${priceInfo.discount_percent}%
    //             Final price: ${priceInfo.final_formatted}
    //         `);
    //     });
    //     }
    // );
// });


// rl.on("line", () => {
//     rl.close();
// });

// async function getEpic(gameTitle) {
//     const browser = await puppeteer.launch({headless: false, args: [`--window-size=1280,720`], defaultViewport: {width: 1280, height: 720}});
//     const page = await browser.newPage();

//     const lowercase = gameTitle.toLowerCase();
//     const url = lowercase.replace(" ", "-");

//     await page.goto(`https://store.epicgames.com/en-US/p/${url}`);
//     await page.screenshot({path: "./Scraper Scripts/EpicGames.png"});
//     const price = await page.evaluate(() => {
//         const element = document.querySelector('div.css-169q7x3 > div > div > div > div > span > strong > span');
//         const text = element.innerText;
//         return `Game price: ${text}`;
//     });
//     console.log(price);
//     await browser.close();
// }

// setTimeout(() => {
//     getEpic("Rocket League");
// }, 6000);

// async function getXbox(gameTitle) {
//     const browser = await puppeteer.launch({headless: false, args: [`--window-size=1280,720`], defaultViewport: {width: 1280, height: 720}});
//     const page = await browser.newPage();

//     await page.goto("https://www.xbox.com/en-CA/");
    
//     console.log("searching...");
//     setTimeout(async () => {
//         await page.click("button#search");
//         await page.type("input#cli_shellHeaderSearchInput", gameTitle, {delay: 300});
//         setTimeout(async () => {
//             await page.click('a[aria-posinset="1"]');
//             let mainPrice;

//             setTimeout(async () => {
//                 mainPrice = await page.evaluate(async() => {
//                     return document.querySelector("span.Price-module__boldText___1i2Li.Price-module__moreText___sNMVr.AcquisitionButtons-module__listedPrice___PS6Zm").innerText;
//                 });
//                 console.log(`Main price: ${mainPrice}`);
//                 await page.screenshot({path: "./Scraper Scripts/Xbox.png"});
//                 await browser.close();
//             }, 3000);
//         }, 500);
//     }, 500);
// }

// getXbox("Minecraft");

// async function getPlayStation(gameTitle) {
//     const browser = await puppeteer.launch({headless: false, args: [`--window-size=1280,720`], defaultViewport: {width: 1280, height: 720}});
//     const page = await browser.newPage();

//     await page.goto("https://store.playstation.com/en-ca/");

//     setTimeout(async () => {
//         await page.click(".shared-nav-search");
//         await page.type(".search-text-box__input", gameTitle, {delay: 500});
//         await page.click(".jetstream-search__search-button");

//         setTimeout(async () => {
//                 const data = await page.evaluate(() => {
//                 let prices = [];
//                 let titles = [];

//                 const priceElements = document.querySelectorAll(".psw-m-r-3");
//                 const titleElements = document.querySelectorAll("#product-name");
//                 for (let i = 0; i < 6; i++) {
//                     prices.push(priceElements[i].innerText);
//                     titles.push(titleElements[i].innerText);
//                 }
//                 let data = {
//                     "Result 1": {"Title": titles[0], "Price": prices[0]},
//                     "Result 2": {"Title": titles[1], "Price": prices[1]},
//                     "Result 3": {"Title": titles[2], "Price": prices[2]},
//                     "Result 4": {"Title": titles[3], "Price": prices[3]},
//                     "Result 5": {"Title": titles[4], "Price": prices[4]},
//                     "Result 6": {"Title": titles[5], "Price": prices[5]}
//                 };
                
//                 return data;
//             });
//             console.log(data);
//             await page.screenshot({path: "./Scraper Scripts/PlayStation.png"});
//             await browser.close();
//         }, 3000);
        
//     }, 1500);
// }

// getPlayStation("God Of War");