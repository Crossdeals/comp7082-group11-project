const puppeteer = require('puppeteer');
const readline = require('readline');
const https = require('https');
const axios = require('axios');
const { randomInt } = require('crypto');
const sleep = require('node:timers/promises');

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// rl.question("GameID (Steam):\n", (gameid) => {
//     GetSteam(gameid);
// });

const ValidGameTitles = [
    "MINECRAFT",
    "GOD OF WAR",
    "SATISFACTORY",
    "GHOST OF TSUSHIMA",
    "MARIOKART 8",
    "SUPER MARIO PARTY JAMBOREE",
    "GRAND THEFT AUTO V",
    "HALO INFINITE",
    "BATTLEFIELD 6: PHANTOM EDITION",
    "PAPER MARIO"
];
const CheckIsNum = new RegExp("[0-9]");

function isValidGameTitle(gameTitle) {
    if (ValidGameTitles.includes(gameTitle.toUpperCase())) return true;
    else return false;
}

function GetPriceFromString(string) {
    if (string.toLowerCase() == "free" || string.toLowerCase() == "free+" || string.toLowerCase() == "ree") {
        return 0.0;
    } else if (CheckIsNum.test(string)) {
        return parseFloat(string);
    } else {
        return -1.0;
    }
}

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

async function GetEpic(gameTitles, titleCount = 1) {
    let data = [];
    
    if(titleCount > 1) {
        for (let i = 0; i < titleCount; i++) {
            if (isValidGameTitle(gameTitles[i])) {
                const browser = await puppeteer.launch({headless: false, args: [`--window-size=1280,720`], defaultViewport: {width: 1280, height: 720}});
                const page = await browser.newPage();

                const lowercase = gameTitles[i].toLowerCase();
                const url = lowercase.replaceAll(" ", "-").replaceAll(":", "-");
                
                await page.goto(`https://store.epicgames.com/en-US/p/${url}`);
                await sleep.setTimeout(500);
                
                await page.click('button#month_toggle');
                let rand_1 = randomInt(1, 12);
                let selectorString1 = 'ul#month_menu > li';
                for (let j = 0; j < rand_1; j++) {
                    selectorString1 += ' + li';
                }
                selectorString1 += ' > button';
                await page.click(selectorString1); await sleep.setTimeout(100);
                
                await page.click('button#day_toggle');
                let rand_2 = randomInt(1, 25);
                let selectorString2 = 'ul#day_menu > li';
                for (let j = 0; j < rand_2; j++) {
                    selectorString2 += ' + li';
                }
                selectorString2 += ' > button';
                await page.click(selectorString2); await sleep.setTimeout(100);
                
                await page.click('button#year_toggle');
                let rand_3 = randomInt(20, 30);
                let selectorString3 = 'ul#year_menu > li';
                for (let j = 0; j < rand_3; j++) {
                    selectorString3 += ' + li';
                }
                selectorString3 += ' > button';
                await page.click(selectorString3); await sleep.setTimeout(100);
                
                await page.click('button#btn_age_continue');

                await sleep.setTimeout(1000);

                let isWarningRated = await page.evaluate(() => {
                    let element = document.querySelector("aside > div > div > a");
                    return element != null;
                });

                await sleep.setTimeout(1000);
                console.log(`rated: ${isWarningRated}`);

                let isDiscounted = await page.evaluate((isWarningRated) => {
                    if (isWarningRated) {
                        let element = document.querySelector("aside > div > div > a + div + div > div");
                        let text = element?.querySelector("div > div > div > div > span")?.textContent ?? "0%";
                        return text != "0%" && text.includes("%");
                    } else {
                        let element = document.querySelector("aside > div > div > div + div + div + div > div");
                        let text = element?.querySelector("div > div > div > div > span")?.textContent ?? "0%";
                        return text != "0%" && text.includes("%");
                    }
                }, isWarningRated);

                await sleep.setTimeout(1000);
                console.log(`discounted: ${isDiscounted}`);

                let gameData = await page.evaluate((gameTitle, isDiscounted, isWarningRated) => {
                    let data;
                    if (isDiscounted && isWarningRated) {
                        let element = document.querySelector("aside > div > div > a + div + div > div");
                        data = {
                            "Title": gameTitle,
                            "OriginalPrice": element.querySelector("div > div > div + div > div > div > span")?.textContent.substring(3) + "1" ?? element.querySelector("strong")?.textContent.substring(3) ?? "0",
                            "DiscountPrice": element.querySelector("div > div > div + div > div + div > div > span")?.textContent.substring(3) ?? element.querySelector("strong")?.textContent.substring(3) ?? "0",
                            "DiscountPerc": element.querySelector("div > div > div > div > div > span")?.textContent ?? "0%",
                            "EndDate": element.querySelector("div + span > span")?.textContent.substring(10) ?? null
                        }
                    } else if (isWarningRated) {
                        let element = document.querySelector("aside > div > div > a + div + div > div");
                        data = {
                            "Title": gameTitle,
                            "OriginalPrice": element.querySelector("div > div > div > div > span")?.textContent.substring(3) ?? "0",
                            "DiscountPrice": element.querySelector("div > div > div > div > span")?.textContent.substring(3) ?? "0",
                            "DiscountPerc": "0%",
                            "EndDate": null
                        }
                    } else if (isDiscounted) {
                        let element = document.querySelector("aside > div > div > div + div + div + div > div");
                        data = {
                            "Title": gameTitle,
                            "OriginalPrice": element.querySelector("div > div > div + div > div > div > span")?.textContent.substring(3) + "1" ?? element.querySelector("strong")?.textContent.substring(3) ?? "0",
                            "DiscountPrice": element.querySelector("div > div > div + div > div + div > div > span")?.textContent.substring(3) ?? element.querySelector("strong")?.textContent.substring(3) ?? "0",
                            "DiscountPerc": element.querySelector("div > div > div > div > div > span")?.textContent ?? "0%",
                            "EndDate": element.querySelector("div + span > span")?.textContent.substring(10) ?? null
                        }
                    } else {
                        let element = document.querySelector("aside > div > div > div + div + div + div");
                        data = {
                            "Title": gameTitle,
                            "OriginalPrice": element.querySelector("div > div > div > div > span")?.textContent.substring(3) ?? "0",
                            "DiscountPrice": element.querySelector("div > div > div > div > span")?.textContent.substring(3) ?? "0",
                            "DiscountPerc": "0%",
                            "EndDate": null
                        }
                    }
                    return data;
                }, gameTitles[i], isDiscounted, isWarningRated);

                await sleep.setTimeout(1000);

                data[i] = {
                    "Title": gameData["Title"],
                    "OriginalPrice": GetPriceFromString(gameData["OriginalPrice"]),
                    "DiscountPrice": GetPriceFromString(gameData["DiscountPrice"]),
                    "DiscountPerc": gameData["DiscountPerc"],
                    "EndDate": gameData["EndDate"]
                }
                await browser.close();
            } else {
                data[i] = null;
            }
        }
    } else {
        if (isValidGameTitle(gameTitles)) {
            const browser = await puppeteer.launch({headless: false, args: [`--window-size=1280,720`], defaultViewport: {width: 1280, height: 720}});
            const page = await browser.newPage();

            const lowercase = gameTitles.toLowerCase();
            const url = lowercase.replaceAll(" ", "-").replaceAll(":", "-");
            
            await page.goto(`https://store.epicgames.com/en-US/p/${url}`);
            await sleep.setTimeout(500);
            
            await page.click('button#month_toggle');
            let rand_1 = randomInt(1, 12);
            let selectorString1 = 'ul#month_menu > li';
            for (let j = 0; j < rand_1; j++) {
                selectorString1 += ' + li';
            }
            selectorString1 += ' > button';
            await page.click(selectorString1); await sleep.setTimeout(100);
            
            await page.click('button#day_toggle');
            let rand_2 = randomInt(1, 25);
            let selectorString2 = 'ul#day_menu > li';
            for (let j = 0; j < rand_2; j++) {
                selectorString2 += ' + li';
            }
            selectorString2 += ' > button';
            await page.click(selectorString2); await sleep.setTimeout(100);
            
            await page.click('button#year_toggle');
            let rand_3 = randomInt(20, 30);
            let selectorString3 = 'ul#year_menu > li';
            for (let j = 0; j < rand_3; j++) {
                selectorString3 += ' + li';
            }
            selectorString3 += ' > button';
            await page.click(selectorString3); await sleep.setTimeout(100);
            
            await page.click('button#btn_age_continue');

            await sleep.setTimeout(1000);

            let isWarningRated = await page.evaluate(() => {
                let element = document.querySelector("aside > div > div > a");
                return element != null;
            });

            await sleep.setTimeout(1000);
            console.log(`rated: ${isWarningRated}`);

            let isDiscounted = await page.evaluate((isWarningRated) => {
                if (isWarningRated) {
                    let element = document.querySelector("aside > div > div > a + div + div > div");
                    let text = element?.querySelector("div > div > div > div > span")?.textContent ?? "0%";
                    return text != "0%" && text.includes("%");
                } else {
                    let element = document.querySelector("aside > div > div > div + div + div + div > div");
                    let text = element?.querySelector("div > div > div > div > span")?.textContent ?? "0%";
                    return text != "0%" && text.includes("%");
                }
            }, isWarningRated);

            await sleep.setTimeout(1000);
            console.log(`discounted: ${isDiscounted}`);

            let gameData = await page.evaluate((gameTitle, isDiscounted, isWarningRated) => {
                let data;
                if (isDiscounted && isWarningRated) {
                    let element = document.querySelector("aside > div > div > a + div + div > div");
                    data = {
                        "Title": gameTitle,
                        "OriginalPrice": element.querySelector("div > div > div + div > div > div > span")?.textContent.substring(3) + "1" ?? element.querySelector("strong")?.textContent.substring(3) ?? "0",
                        "DiscountPrice": element.querySelector("div > div > div + div > div + div > div > span")?.textContent.substring(3) ?? element.querySelector("strong")?.textContent.substring(3) ?? "0",
                        "DiscountPerc": element.querySelector("div > div > div > div > div > span")?.textContent ?? "0%",
                        "EndDate": element.querySelector("div + span > span")?.textContent.substring(10) ?? null
                    }
                } else if (isWarningRated) {
                    let element = document.querySelector("aside > div > div > a + div + div > div");
                    data = {
                        "Title": gameTitle,
                        "OriginalPrice": element.querySelector("div > div > div > div > span")?.textContent.substring(3) ?? "0",
                        "DiscountPrice": element.querySelector("div > div > div > div > span")?.textContent.substring(3) ?? "0",
                        "DiscountPerc": "0%",
                        "EndDate": null
                    }
                } else if (isDiscounted) {
                    let element = document.querySelector("aside > div > div > div + div + div + div > div");
                    data = {
                        "Title": gameTitle,
                        "OriginalPrice": element.querySelector("div > div > div + div > div > div > span")?.textContent.substring(3) + "1" ?? element.querySelector("strong")?.textContent.substring(3) ?? "0",
                        "DiscountPrice": element.querySelector("div > div > div + div > div + div > div > span")?.textContent.substring(3) ?? element.querySelector("strong")?.textContent.substring(3) ?? "0",
                        "DiscountPerc": element.querySelector("div > div > div > div > div > span")?.textContent ?? "0%",
                        "EndDate": element.querySelector("div + span > span")?.textContent.substring(10) ?? null
                    }
                } else {
                    let element = document.querySelector("aside > div > div > div + div + div + div");
                    data = {
                        "Title": gameTitle,
                        "OriginalPrice": element.querySelector("div > div > div > div > span")?.textContent.substring(3) ?? "0",
                        "DiscountPrice": element.querySelector("div > div > div > div > span")?.textContent.substring(3) ?? "0",
                        "DiscountPerc": "0%",
                        "EndDate": null
                    }
                }
                return data;
            }, gameTitles, isDiscounted, isWarningRated);

            await sleep.setTimeout(1000);

            data[0] = {
                "Title": gameData["Title"],
                "OriginalPrice": GetPriceFromString(gameData["OriginalPrice"]),
                "DiscountPrice": GetPriceFromString(gameData["DiscountPrice"]),
                "DiscountPerc": gameData["DiscountPerc"],
                "EndDate": gameData["EndDate"]
            }
            await browser.close();
        } else {
            data[0] = null;
        }
    }
    return data;
}

async function GetXbox(gameTitles, titleCount = 1) {
    let data = [];
    const browser = await puppeteer.launch({headless: false, args: [`--window-size=1280,720`], defaultViewport: {width: 1280, height: 720}});
    const page = await browser.newPage();
    await page.goto("https://www.xbox.com/en-CA/");
    if (titleCount > 1) {
        let a = 0;
        for (let i = 0; i < titleCount; i++) {
            if (isValidGameTitle(gameTitles[i])) {
                console.log(`Searching game title: ${gameTitles[i]}`);
                await page.click("button#search");
                await sleep.setTimeout(250);
                for (let j = 0; j < 100; j++) {
                    await page.keyboard.press("Backspace");
                }
                await page.type("input#cli_shellHeaderSearchInput", gameTitles[i], {delay: 300});

                await page.keyboard.press("Enter");
                await page.waitForNavigation();
                let gameDataList;

                await page.waitForSelector("div.ProductCard-module__cardWrapper___6Ls86 > a > div + div", {timeout: 3000});
                await sleep.setTimeout(1500);
                
                gameDataList = await page.evaluate((gameTitle) => {
                    let itemsList = document.querySelectorAll("div.ProductCard-module__infoBox___M5x18");
                    let dataList = [];
                    let j = 0;
                    itemsList.forEach(element => {
                        if (element.innerText.includes(gameTitle)) {
                            let data = {
                                "Title": element.querySelector("span").textContent,
                                "OriginalPrice": element.querySelector("div > div > span")?.textContent.substring(5) ?? element.querySelector("span + span")?.textContent,
                                "DiscountPrice": element.querySelector("div > div > span + span")?.textContent.substring(5) ?? element.querySelector("div > div > span")?.textContent.substring(5) ?? element.querySelector("span + span")?.textContent,
                                "DiscountPerc": element.querySelector("div > div + div")?.textContent ?? "0%"
                            };
                            dataList[j] = data;
                            j++;
                        }
                    });
                    return dataList;
                }, gameTitles[i]);

                await sleep.setTimeout(1000);
                let gameData = [];
                gameData.length = gameDataList.length;
                for (let i = 0; i < gameDataList.length; i++) {
                    gameData[i] = {
                        "Title": gameDataList[i]["Title"],
                        "OriginalPrice": GetPriceFromString(gameDataList[i]["OriginalPrice"]),
                        "DiscountPrice": GetPriceFromString(gameDataList[i]["DiscountPrice"]),
                        "DiscountPerc": gameDataList[i]["DiscountPerc"]
                    }
                }

                if (gameData.length > 1) {
                    for (let x = i + a, y = 0; y < gameData.length; x++,a++,y++) {
                        data[x] = gameData[y];
                    }
                } else {
                    data[i+a] = gameData[0];
                }
            } else data[i+a] = null;
        }
    } else {
        if (isValidGameTitle(gameTitles)) {
            console.log(`Searching game title: ${gameTitles}`);
            await page.click("button#search");
            await sleep.setTimeout(250);
            await page.type("input#cli_shellHeaderSearchInput", gameTitles, {delay: 300});

            await page.keyboard.press("Enter");
            let gameDataList;

            await page.waitForSelector("div.ProductCard-module__cardWrapper___6Ls86 > a > div + div", {timeout: 3000});
            await sleep.setTimeout(500);
            
            gameDataList = await page.evaluate((gameTitle) => {
                let itemsList = document.querySelectorAll("div.ProductCard-module__infoBox___M5x18");
                let dataList = [];
                let j = 0;
                itemsList.forEach(element => {
                    if (element.innerText.includes(gameTitle)) {
                        let data = {
                            "Title": element.querySelector("span").textContent,
                            "OriginalPrice": element.querySelector("div > div > span")?.textContent.substring(5) ?? element.querySelector("span + span")?.textContent,
                            "DiscountPrice": element.querySelector("div > div > span + span")?.textContent.substring(5) ?? element.querySelector("div > div > span")?.textContent.substring(5) ?? element.querySelector("span + span")?.textContent,
                            "DiscountPerc": element.querySelector("div > div + div")?.textContent ?? "0%"
                        };
                        dataList[j] = data;
                        j++;
                    }
                });
                return dataList;
            }, gameTitles);

            await sleep.setTimeout(1000);
            let gameData = [];
            gameData.length = gameDataList.length;
            for (let i = 0; i < gameDataList.length; i++) {
                gameData[i] = {
                    "Title": gameDataList[i]["Title"],
                    "OriginalPrice": GetPriceFromString(gameDataList[i]["OriginalPrice"]),
                    "DiscountPrice": GetPriceFromString(gameDataList[i]["DiscountPrice"]),
                    "DiscountPerc": gameDataList[i]["DiscountPrice"]
                }
            }
            
            if (gameData.length > 1) {
                for (let a = 0; a < gameData.length; a++) {
                    data[a] = gameData[a];
                }
            } else data[0] = gameData[0];
        } else data[0] = null;
    }
    await browser.close();
    return data;
}

async function GetPlayStation(gameTitles, titleCount = 1) {
    const browser = await puppeteer.launch({headless: false, args: [`--window-size=1280,720`], defaultViewport: {width: 1280, height: 720}});
    const page = await browser.newPage();

    await page.goto("https://store.playstation.com/en-ca/");

    let data = [];

    if (titleCount > 1) {
        let b = 0;
        for (let a = 0; a < titleCount; a++) {
            if (isValidGameTitle(gameTitles[a])) {
                await page.click(".shared-nav-search");
                await page.type(".search-text-box__input", gameTitles[a], {delay: 200});
                await page.keyboard.press("Enter");

                await sleep.setTimeout(1000);

                let gameData = await page.evaluate(() => {
                    let elements = document.querySelector("ul.psw-grid-list").querySelectorAll("li");
                    let data = [];
                    elements.forEach((e) => {
                        data.push({
                            "Title": e.querySelector("div > div > a > span > span").textContent,
                            "OriginalPrice": e.querySelector("div > div > div.psw-price > div > span + span + s")?.textContent ?? e.querySelector("div > div > div.psw-price > div > span")?.textContent ?? e.querySelector("div > div > div.psw-price > span")?.textContent ?? "0",
                            "DiscountPrice": e.querySelector("div > div > div.psw-price > div > span")?.textContent ?? e.querySelector("div > div > div.psw-price > span")?.textContent ?? "0",
                            "DiscountPerc": e.querySelector("div > div > a + div + span + div > span")?.textContent ?? "0%"
                        });
                    });
                    return data;
                });

                await sleep.setTimeout(3000);
                let discountedArr = [];
                for (let i = 0; i < gameData.length; i++) {
                    let test = "";
                    for (let j = 0; j < i; j++) {
                        test += " + li";
                    }
                    console.log(test);
                    let selector = "ul.psw-grid-list > li";
                    for (let j = 0; j < i; j++) {
                        selector += " + li";
                    }
                    selector += " > div > div > a";
                    console.log(`discount percent: ${gameData[i]["DiscountPerc"]}`);
                    if (gameData[i]["DiscountPerc"] != "0%" && gameData[i]["DiscountPerc"].includes("%")) {
                        await page.click(selector);
                        await page.waitForNavigation();
                        await sleep.setTimeout(1000);
                        discountedArr[i] = await page.evaluate(() => {
                            return document.querySelectorAll("span.psw-c-t-2")[1]?.textContent.substring(11) ?? "none";
                        });
                        await sleep.setTimeout(1000);
                        await page.goBack();
                        await sleep.setTimeout(2000);
                    } else {
                        discountedArr[i] = null;
                    }
                }
                await sleep.setTimeout(1500);

                if (gameData.length > 1) {
                    for (let x = a + b, y = 0; y < gameData.length; b++,x++,y++) {
                        let title, origPrice, discPrice, discPerc, endDate;
                        title = gameData[y]["Title"]; origPrice = gameData[y]["OriginalPrice"];
                        discPrice = gameData[y]["DiscountPrice"]; endDate = discountedArr[y];
                        if (!gameData[y]["DiscountPerc"].includes("%")) {
                            discPerc = null;
                        } else {
                            discPerc = gameData[y]["DiscountPerc"];
                        }
                        data[x] = {
                            "Title": title,
                            "OriginalPrice": origPrice,
                            "DiscountPrice": discPrice,
                            "DiscountPerc": discPerc,
                            "EndDate": endDate
                        }
                    }
                } else {
                    let title, origPrice, discPrice, discPerc, endDate;
                    title = gameData[0]["Title"]; origPrice = GetPriceFromString(gameData[0]["OriginalPrice"]);
                    discPrice = GetPriceFromString(gameData[0]["DiscountPrice"]); endDate = discountedArr[0];
                    if (!gameData[0]["DiscountPerc"].includes("%")) {
                        discPerc = null;
                    } else {
                        discPerc = gameData[0]["DiscountPerc"];
                    }
                    data[0] = {
                        "Title": title,
                        "OriginalPrice": origPrice,
                        "DiscountPrice": discPrice,
                        "DiscountPerc": discPerc,
                        "EndDate": endDate
                    }
                }
            } else data[a+b] = null;
        }
    } else {
        if (isValidGameTitle(gameTitles)) {
            await page.click(".shared-nav-search");
            await page.type(".search-text-box__input", gameTitles, {delay: 200});
            await page.keyboard.press("Enter");

            await sleep.setTimeout(1000);

            let gameData = await page.evaluate(() => {
                let elements = document.querySelector("ul.psw-grid-list").querySelectorAll("li");
                let data = [];
                elements.forEach((e) => {
                    data.push({
                        "Title": e.querySelector("div > div > a > span > span").textContent,
                        "OriginalPrice": e.querySelector("div > div > div.psw-price > div > span + span + s")?.textContent ?? e.querySelector("div > div > div.psw-price > div > span")?.textContent ?? e.querySelector("div > div > div.psw-price > span")?.textContent ?? "0",
                        "DiscountPrice": e.querySelector("div > div > div.psw-price > div > span")?.textContent ?? e.querySelector("div > div > div.psw-price > span")?.textContent ?? "0",
                        "DiscountPerc": e.querySelector("div > div > a + div + span + div > span")?.textContent ?? "0%"
                    });
                });
                return data;
            });

            await sleep.setTimeout(3000);
            let discountedArr = [];
            for (let i = 0; i < gameData.length; i++) {
                let test = "";
                for (let j = 0; j < i; j++) {
                    test += " + li";
                }
                console.log(test);
                let selector = "ul.psw-grid-list > li";
                for (let j = 0; j < i; j++) {
                    selector += " + li";
                }
                selector += " > div > div > a";
                console.log(`discount percent: ${gameData[i]["DiscountPerc"]}`);
                if (gameData[i]["DiscountPerc"] != "0%" && gameData[i]["DiscountPerc"].includes("%")) {
                    await page.click(selector);
                    await page.waitForNavigation();
                    await sleep.setTimeout(1000);
                    discountedArr[i] = await page.evaluate(() => {
                        return document.querySelectorAll("span.psw-c-t-2")[1]?.textContent.substring(11) ?? "none";
                    });
                    await sleep.setTimeout(1000);
                    await page.goBack();
                    await sleep.setTimeout(2000);
                } else {
                    discountedArr[i] = null;
                }
            }
            await sleep.setTimeout(1500);
            for (let i = 0; i < gameData.length; i++) {
                let title, origPrice, discPrice, discPerc, endDate;
                title = gameData[i]["Title"]; origPrice = GetPriceFromString(gameData[i]["OriginalPrice"]);
                discPrice = GetPriceFromString(gameData[i]["DiscountPrice"]); endDate = discountedArr[i];
                if (!gameData[i]["DiscountPerc"].includes("%")) {
                    discPerc = null;
                } else {
                    discPerc = gameData[i]["DiscountPerc"];
                }
                data[i] = {
                    "Title": title,
                    "OriginalPrice": origPrice,
                    "DiscountPrice": discPrice,
                    "DiscountPerc": discPerc,
                    "EndDate": endDate
                }
            }
        } else data[0] = null;
    }
    await browser.close();
    return data;
}

async function GetNintendo(gameTitles, titleCount = 1) {
    const browser = await puppeteer.launch({headless: false, args: [`--window-size=1280,720`], defaultViewport: {width: 1280, height: 720}})
    const page = await browser.newPage();
    await page.goto("https://www.nintendo.com/us/store/games/");

    let data = [];
    if (titleCount > 1) {
        for (let i = 0; i < titleCount; i++) {
            if (isValidGameTitle(gameTitles[i])) {

                await page.waitForSelector("#search");
                await page.click("#search");

                await page.waitForSelector(".sc-ax1lsj-1.fvPwkD.sc-1r59ztq-5.fmtMqf");
                await sleep.setTimeout(1000);
                await page.type(".sc-ax1lsj-1.fvPwkD.sc-1r59ztq-5.fmtMqf", gameTitles[i], {delay: 200});
                await page.keyboard.press("Enter");

                await page.waitForSelector(".W990N.SH2al");
                await page.waitForSelector(".s954l.qIo1e._39p7O.bC4e6");
                await sleep.setTimeout(1000);

                try {
                    await page.click("section > div > div > div > h2 + a");
                } catch (e) {
                    console.log("Already on the search results page, not clicking on the 'See All' button");
                }
                
                await sleep.setTimeout(1000);
                let gameData = await page.evaluate(() => {
                    let data = [];
                    let list = document.querySelectorAll("div.HRRF1.Duonm");

                    list.forEach(e => {
                        data.push({
                            "Title": e.querySelector("div > h3")?.innerText ?? "err",
                            "OriginalPrice": e.querySelector("div + div + div > div > div > span")?.innerText.substring(16) ?? "0",
                            "DiscountPrice": e.querySelector("div + div + div > div > div > div > div > div")?.innerText.substring(16) ?? e.querySelector("div + div + div > div > div > span")?.innerText.substring(16) ?? "0",
                            "DiscountPerc": e.querySelector("div + div + div > div > div > div + span + div")?.innerText ?? "0%",
                            "EndDate": e.querySelector("div + div")?.innerText ?? null
                        });
                    });

                    return data;
                });
                await sleep.setTimeout(1500);
                gameData.forEach(i => {
                    let endDate = i["EndDate"].substring(11);
                    if (i["EndDate"] == "Free download") endDate = "";
                    data.push({
                        "Title": i["Title"],
                        "OriginalPrice": GetPriceFromString(i["OriginalPrice"]),
                        "DiscountPrice": GetPriceFromString(i["DiscountPrice"]),
                        "DiscountPerc": i["DiscountPerc"],
                        "EndDate": endDate
                    });
                });
            } else data.push(null);
        }
    } else {
        if (isValidGameTitle(gameTitles)) {

            await page.waitForSelector("#search");
            await page.click("#search");

            await page.waitForSelector(".sc-ax1lsj-1.fvPwkD.sc-1r59ztq-5.fmtMqf");
            await sleep.setTimeout(1000);
            await page.type(".sc-ax1lsj-1.fvPwkD.sc-1r59ztq-5.fmtMqf", gameTitles, {delay: 200});
            await page.keyboard.press("Enter");

            await page.waitForSelector(".W990N.SH2al");
            await page.waitForSelector(".s954l.qIo1e._39p7O.bC4e6");
            await sleep.setTimeout(1000);

            await page.click("section > div > div > div > h2 + a");
            await sleep.setTimeout(1000);
            let gameData = await page.evaluate(() => {
                let data = [];
                let list = document.querySelectorAll("div.HRRF1.Duonm");

                list.forEach(e => {
                    data.push({
                        "Title": e.querySelector("div > h3")?.innerText ?? "err",
                        "OriginalPrice": e.querySelector("div + div + div > div > div > span")?.innerText.substring(16) ?? "0",
                        "DiscountPrice": e.querySelector("div + div + div > div > div > div > div > div")?.innerText.substring(16) ?? e.querySelector("div + div + div > div > div > span")?.innerText.substring(16) ?? "0",
                        "DiscountPerc": e.querySelector("div + div + div > div > div > div + span + div")?.innerText ?? "0%",
                        "EndDate": e.querySelector("div + div")?.innerText ?? null
                    });
                });

                return data;
            });
            await sleep.setTimeout(1500);
            gameData.forEach(i => {
                let endDate = i["EndDate"].substring(11);
                if (i["EndDate"] == "Free download") endDate = "";
                data.push({
                    "Title": i["Title"],
                    "OriginalPrice": GetPriceFromString(i["OriginalPrice"]),
                    "DiscountPrice": GetPriceFromString(i["DiscountPrice"]),
                    "DiscountPerc": i["DiscountPerc"],
                    "EndDate": endDate
                });
            });
        } else data[0] = null;
    }
    await browser.close();
    return data;
}

// ----------   TESTS   ----------

// Test Steam
async function TestSteam() {
    let steamIDs = /*["304390", "2507950", "1240440"];*/ ["1069650"];
    let realPrices = [39.99, 0.00, 0.00];
    // First tests the price of For Honor (39.99), then the price of Delta Force (free), and then the price of Halo Infinite (free, but has paid DLC)
    for (let i = 0; i < steamIDs.length; i++) {
        let results = await GetSteam(steamIDs[i]);
        console.log(`${results} == ${realPrices[i]}: ${results == realPrices[i]}`);
        console.log(`Full results array: ${results}`);
    }
}
// TestSteam();

// Test Epic Games:
async function TestEpic() {
    let gameTitles = ["Satisfactory", "Grand Theft Auto V", "Rocket League", "Battlefield 6: Phantom Edition"];
    let realPrices = [51.99, 44.99];
    // First tests the price of Satisfactory (51.99), then the price of GTA V (44.99), and then the price of __ (__)
    // for (let i = 0; i < gameTitles.length; i++) {
    //     let results = await GetEpic(gameTitles[i]);
    //     console.log(`${results} == ${realPrices[i]}: ${results == realPrices[i]}`);
    // }
    let results = await GetEpic(gameTitles, gameTitles.length);
    console.log(results);
}
// TestEpic();

// Test Xbox:
async function TestXbox() {
    let gameTitles = ["Minecraft", "Battlefield 6", "Halo Infinite"];
    let realPrices = [25.99, 89.99];
    // First tests the price of Minecraft (25.99), then the price of BF6 (89.99), and then the price of __ (__)
    let results = await GetXbox(gameTitles, gameTitles.length);
    console.log(results);
}
// TestXbox();

// Test PlayStation
async function TestPlayStation() {
    let gameTitles = ["Ghost of Tsushima", "God of War", "Astro Bot"];
    let realPrices = [89.99, 19.99, 79.99];
    // First tests price of Ghost of Tsushima (89.99), God of War 2018 (19.99), and ASTRO BOT (79.99)
    let results = await GetPlayStation(gameTitles, gameTitles.length);
    console.log(results);
}
// TestPlayStation();

// Test Nintendo
async function TestNintendo() {
    let gameTitles = ["Mariokart 8", "Super Mario Party Jamboree", "Kirby and the Forgotten Land", "Paper Mario"];
    let realPrices = [24.99, 59.99, 59.99];
    // First tests price of Mario Kart 8 Deluxe (24.99), Mario Party Jamboree (59.99), and Kirby the Forgotten Land (59.99)
    let results = await GetNintendo(gameTitles, gameTitles.length);
    console.log(results);
}
// TestNintendo();