const puppeteer = require('puppeteer');
const axios = require('axios');
const { randomInt } = require('crypto');
const sleep = require('node:timers/promises');

const CheckIsNum = new RegExp("[0-9]");

function GetPriceFromString(string) {
    // Had to be so specific because each website has completely different ways to display that a game is free
    if (string.toLowerCase() == "free" || string.toLowerCase() == "free+" || string.toLowerCase() == "ree") {
        return 0.0;
    } else if (CheckIsNum.test(string)) { // Simply checks if the string contains a digit
        return parseFloat(string);
    } else { // Otherwise it's not free or a number, return -1
        return -1.0;
    }
}

async function GetSteam(gameid) { // Unlike the rest of the scrapers, requires a SteamID for the game. Only handles 1 game at a time
    let price = 0;
    let url = `https://store.steampowered.com/api/appdetails/?appids=${gameid}&filters=price_overview`;
    console.log(`Composed URL: ${url}`);
    await axios.get(url).then((res) => {
        let result = res.data;
        let priceInfo = result[`${gameid}`]["data"]["price_overview"];
        if (priceInfo != undefined){
            price = priceInfo.final/100;
        } else {
            price = 0.00;
        }
    },(error) => {
        console.log(error);
    });
    return price;
}

async function GetEpic(gameTitles, titleCount = 1) {
    let data = [];
    
    if(titleCount > 1) { // If there is more than 1 game title in the list, loop through the process multiple times
        for (let i = 0; i < titleCount; i++) {
            try {
                // Headless does not work for whatever reason, likely because the headless version does not actually load the pages
                const browser = await puppeteer.launch({headless: false, args: [`--window-size=1280,720`], defaultViewport: {width: 1280, height: 720}});
                const page = await browser.newPage();

                // Converts the title to what the EGS link uses
                const lowercase = gameTitles[i].toLowerCase();
                const url = lowercase.replaceAll(" ", "-").replaceAll(":", "-");
                
                // Loads the page and waits for the page to load
                await page.goto(`https://store.epicgames.com/en-US/p/${url}`);
                await sleep.setTimeout(500);
                
                // These 3 are used only for bypassing the age restriction on applicable games
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

                await sleep.setTimeout(1000); // Waits for the age restriction page to disappear

                // Games can have the ESRB warning rating (T, M, 18+, etc) which changes how the scraper needs to handle data collection
                let isWarningRated = await page.evaluate(() => {
                    let element = document.querySelector("aside > div > div > a");
                    return element != null;
                });

                await sleep.setTimeout(1000);
                console.log(`rated: ${isWarningRated}`);

                // Like with ESRB rating, discounted or not affects how data collection is handled
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

                // Outputs an object with all data listed on the page for the game.
                let gameData = await page.evaluate((gameTitle, isDiscounted, isWarningRated) => {
                    let data;
                    if (isDiscounted && isWarningRated) { // If both are true, price elements are in different places,
                        // and we find the deal end date
                        let element = document.querySelector("aside > div > div > a + div + div > div");
                        data = {
                            "Title": gameTitle,
                            "OriginalPrice": element.querySelector("div > div > div + div > div > div > span")?.textContent.substring(3) + "1" ?? element.querySelector("strong")?.textContent.substring(3) ?? "0",
                            "DiscountPrice": element.querySelector("div > div > div + div > div + div > div > span")?.textContent.substring(3) ?? element.querySelector("strong")?.textContent.substring(3) ?? "0",
                            "DiscountPerc": element.querySelector("div > div > div > div > div > span")?.textContent ?? "0%",
                            "EndDate": element.querySelector("div + span > span")?.textContent.substring(10) ?? null
                        }
                    } else if (isWarningRated) { // If just rated, price elements are in different places, and deal end is null
                        let element = document.querySelector("aside > div > div > a + div + div > div");
                        data = {
                            "Title": gameTitle,
                            "OriginalPrice": element.querySelector("div > div > div > div > span")?.textContent.substring(3) ?? "0",
                            "DiscountPrice": element.querySelector("div > div > div > div > span")?.textContent.substring(3) ?? "0",
                            "DiscountPerc": "0%",
                            "EndDate": null
                        }
                    } else if (isDiscounted) { // If just discounted, price elements are in their normal spot, but find deal end
                        let element = document.querySelector("aside > div > div > div + div + div + div > div");
                        data = {
                            "Title": gameTitle,
                            "OriginalPrice": element.querySelector("div > div > div + div > div > div > span")?.textContent.substring(3) + "1" ?? element.querySelector("strong")?.textContent.substring(3) ?? "0",
                            "DiscountPrice": element.querySelector("div > div > div + div > div + div > div > span")?.textContent.substring(3) ?? element.querySelector("strong")?.textContent.substring(3) ?? "0",
                            "DiscountPerc": element.querySelector("div > div > div > div > div > span")?.textContent ?? "0%",
                            "EndDate": element.querySelector("div + span > span")?.textContent.substring(10) ?? null
                        }
                    } else { // If neither, price elements are in their normal spot, and deal end is null
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

                data[i] = { // Adds to outer data array to be returned
                    "Title": gameData["Title"],
                    "OriginalPrice": GetPriceFromString(gameData["OriginalPrice"]),
                    "DiscountPrice": GetPriceFromString(gameData["DiscountPrice"]),
                    "DiscountPerc": gameData["DiscountPerc"],
                    "EndDate": gameData["EndDate"]
                }
                await browser.close();
            } catch (e) {
                console.log(e);
            }
        }
    } else {
        // If only one game is being searched for, we treat the input as one string rather than an array of them,
        // and run only one loop. The multiple game loop also has to reopen the browser for each game because Epic
        // blocks us out if we have session cookies and are not signed in.
        try {
            const browser = await puppeteer.launch({headless: false, args: [`--window-size=1280,720`], defaultViewport: {width: 1280, height: 720}});
            const page = await browser.newPage();

            // Like in the other loop, converts game title to EGS link form
            const lowercase = gameTitles.toLowerCase();
            const url = lowercase.replaceAll(" ", "-").replaceAll(":", "-");
            
            await page.goto(`https://store.epicgames.com/en-US/p/${url}`);
            await sleep.setTimeout(500);
            
            // Like other loop, bypasses age restriction if applicable
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

            // Warning rating and discount status act the same as before, affecting the way data collection is handled
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
                if (isDiscounted && isWarningRated) { // Both discounted and warning rated, affects location on the page,
                    // and end date needs to be gathered
                    let element = document.querySelector("aside > div > div > a + div + div > div");
                    data = {
                        "Title": gameTitle,
                        "OriginalPrice": element.querySelector("div > div > div + div > div > div > span")?.textContent.substring(3) + "1" ?? element.querySelector("strong")?.textContent.substring(3) ?? "0",
                        "DiscountPrice": element.querySelector("div > div > div + div > div + div > div > span")?.textContent.substring(3) ?? element.querySelector("strong")?.textContent.substring(3) ?? "0",
                        "DiscountPerc": element.querySelector("div > div > div > div > div > span")?.textContent ?? "0%",
                        "EndDate": element.querySelector("div + span > span")?.textContent.substring(10) ?? null
                    }
                } else if (isWarningRated) { // Just warning rated, affects location on the page, null end date
                    let element = document.querySelector("aside > div > div > a + div + div > div");
                    data = {
                        "Title": gameTitle,
                        "OriginalPrice": element.querySelector("div > div > div > div > span")?.textContent.substring(3) ?? "0",
                        "DiscountPrice": element.querySelector("div > div > div > div > span")?.textContent.substring(3) ?? "0",
                        "DiscountPerc": "0%",
                        "EndDate": null
                    }
                } else if (isDiscounted) { // Just discounted, normal positioning on the page, find end date
                    let element = document.querySelector("aside > div > div > div + div + div + div > div");
                    data = {
                        "Title": gameTitle,
                        "OriginalPrice": element.querySelector("div > div > div + div > div > div > span")?.textContent.substring(3) + "1" ?? element.querySelector("strong")?.textContent.substring(3) ?? "0",
                        "DiscountPrice": element.querySelector("div > div > div + div > div + div > div > span")?.textContent.substring(3) ?? element.querySelector("strong")?.textContent.substring(3) ?? "0",
                        "DiscountPerc": element.querySelector("div > div > div > div > div > span")?.textContent ?? "0%",
                        "EndDate": element.querySelector("div + span > span")?.textContent.substring(10) ?? null
                    }
                } else { // Neither, normal positioning and null end date
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

            data[0] = { // So that it remains an array (of 1), add to first index
                "Title": gameData["Title"],
                "OriginalPrice": GetPriceFromString(gameData["OriginalPrice"]),
                "DiscountPrice": GetPriceFromString(gameData["DiscountPrice"]),
                "DiscountPerc": gameData["DiscountPerc"],
                "EndDate": gameData["EndDate"]
            }
            await browser.close();
        } catch (e) {
            console.log(e);
        }
    }
    return data;
}

async function GetXbox(gameTitles, titleCount = 1) {
    let data = [];
    const browser = await puppeteer.launch({headless: false, args: [`--window-size=1280,720`], defaultViewport: {width: 1280, height: 720}});
    const page = await browser.newPage();
    await page.goto("https://www.xbox.com/en-CA/");
    if (titleCount > 1) { // If there is more than one game title, loop through each one
        let a = 0; // Used to track the index of where we actually are, since we get details of multiple games and
        // multiple versions of each game
        for (let i = 0; i < titleCount; i++) {
            try {
                console.log(`Searching game title: ${gameTitles[i]}`);
                await page.click("button#search");
                await sleep.setTimeout(250);
                for (let j = 0; j < 1000; j++) {
                    await page.keyboard.press("Backspace");
                }
                await page.type("input#cli_shellHeaderSearchInput", gameTitles[i], {delay: 300});

                await page.keyboard.press("Enter");
                await page.waitForNavigation(); // Loads the search results and waits for it to navigate there
                let gameDataList;

                await page.waitForSelector("div.ProductCard-module__cardWrapper___6Ls86 > a > div + div", {timeout: 3000});
                await sleep.setTimeout(1500);
                
                // Returns an array of objects containing all the data we can scrape from Xbox. They don't have a display for deal end
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
                            dataList[j++] = data;
                        }
                    });
                    return dataList;
                }, gameTitles[i]);

                await sleep.setTimeout(1000);
                let gameData = [];
                gameData.length = gameDataList.length;
                for (let i = 0; i < gameDataList.length; i++) {
                    gameData[i] = { // Processing all the data into a new array to reduce complexity below
                        "Title": gameDataList[i]["Title"],
                        "OriginalPrice": GetPriceFromString(gameDataList[i]["OriginalPrice"]),
                        "DiscountPrice": GetPriceFromString(gameDataList[i]["DiscountPrice"]),
                        "DiscountPerc": gameDataList[i]["DiscountPerc"]
                    }
                }

                if (gameData.length > 1) { // If we got more than 1 version of a game, map the real index of the whole
                    // data to an incremented index of our gathered data
                    for (let x = i + a, y = 0; y < gameData.length; x++,a++,y++) {
                        data[x] = gameData[y];
                    }
                } else { // Otherwise just map it directly to reduce risk of overwriting or out-of-bounds indices
                    data[i+a] = gameData[0];
                }
            } catch (e) {
                console.log(e);
            }
        }
    } else {
        // If there is only one game, use the whole parameter in place of array indices
        try {
            console.log(`Searching game title: ${gameTitles}`);
            await page.click("button#search");
            await sleep.setTimeout(250);
            await page.type("input#cli_shellHeaderSearchInput", gameTitles, {delay: 300});

            await page.keyboard.press("Enter"); // Search game title and wait for results page to load
            let gameDataList;

            await page.waitForSelector("div.ProductCard-module__cardWrapper___6Ls86 > a > div + div", {timeout: 3000});
            await sleep.setTimeout(500);
            
            // Returns an array of all the data we can scrape from Xbox on the game and its various versions
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
                        dataList[j++] = data;
                    }
                });
                return dataList;
            }, gameTitles);

            await sleep.setTimeout(1000);
            let gameData = [];
            gameData.length = gameDataList.length;
            for (let i = 0; i < gameDataList.length; i++) { // Same processing, just to help reduce complexity of below
                gameData[i] = {
                    "Title": gameDataList[i]["Title"],
                    "OriginalPrice": GetPriceFromString(gameDataList[i]["OriginalPrice"]),
                    "DiscountPrice": GetPriceFromString(gameDataList[i]["DiscountPrice"]),
                    "DiscountPerc": gameDataList[i]["DiscountPrice"]
                }
            }
            
            if (gameData.length > 1) { // Simpler than before, set up this way mostly because I copied the code to
                // keep logic consistent
                for (let a = 0; a < gameData.length; a++) {
                    data[a] = gameData[a];
                }
            } else data[0] = gameData[0];
        } catch (e) {
            console.log(e);
        }
    }
    await browser.close();
    return data;
}

async function GetPlayStation(gameTitles, titleCount = 1) {
    const browser = await puppeteer.launch({headless: false, args: [`--window-size=1280,720`], defaultViewport: {width: 1280, height: 720}});
    const page = await browser.newPage();

    await page.goto("https://store.playstation.com/en-ca/");

    let data = [];

    if (titleCount > 1) { // If there are multiple games, search each one individually
        let b = 0; // Like in the Xbox scraper, used to track the actual index where we're placing new data
        for (let a = 0; a < titleCount; a++) {
            try {
                await page.click(".shared-nav-search");
                await page.type(".search-text-box__input", gameTitles[a], {delay: 200});
                await page.keyboard.press("Enter");

                await sleep.setTimeout(1000);

                // Returns a list of objects containing all data for each result except for end date
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

                await sleep.setTimeout(3000); // After the previous loop was handled, we find all games that are discounted
                let discountedArr = [];
                // This loop goes through every result, and opens the page of those that are discounted to get the deal end date
                for (let i = 0; i < gameData.length; i++) {
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

                // Converts all data acquired before into the appropriate form before placing it into the returned data
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
            } catch (e) {
                console.log(e);
            }
        }
    } else {
        // If there is only one game, use the whole parameter and run once
        try {
            await page.click(".shared-nav-search");
            await page.type(".search-text-box__input", gameTitles, {delay: 200});
            await page.keyboard.press("Enter"); // Loads results page

            await sleep.setTimeout(1000);

            // Returns array of all data except for the deal end date for every result
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
            // Much like in the loop, finds all discounted games and loads their page to get the deal end date
            for (let i = 0; i < gameData.length; i++) {
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

            // Processes the data into the returned data
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
        } catch (e) {
            console.log(e);
        }
    }
    await browser.close();
    return data;
}

async function GetNintendo(gameTitles, titleCount = 1) {
    const browser = await puppeteer.launch({headless: false, args: [`--window-size=1280,720`], defaultViewport: {width: 1280, height: 720}})
    const page = await browser.newPage();
    await page.goto("https://www.nintendo.com/us/store/games/");

    let data = [];
    if (titleCount > 1) { // If there are multiple games, loop through them all
        for (let i = 0; i < titleCount; i++) {
            try {
                // Search for a game and wait for results page to load
                await page.waitForSelector("#search");
                await page.click("#search");

                await page.waitForSelector(".sc-ax1lsj-1.fvPwkD.sc-1r59ztq-5.fmtMqf");
                await sleep.setTimeout(1000);
                await page.type(".sc-ax1lsj-1.fvPwkD.sc-1r59ztq-5.fmtMqf", gameTitles[i], {delay: 200});
                await page.keyboard.press("Enter");

                await page.waitForSelector(".W990N.SH2al");
                await page.waitForSelector(".s954l.qIo1e._39p7O.bC4e6");
                await sleep.setTimeout(1000);

                try { // On first game, need to click a button to see all results. Afterward this is unnecessary
                    await page.click("section > div > div > div > h2 + a");
                } catch (e) {
                    console.log("Already on the search results page, not clicking on the 'See All' button");
                }
                
                await sleep.setTimeout(1000);

                // Returns an array of objects with all the data for each game. End date is listed on the card in the
                // results page so it doesn't have to load each one like for PlayStation
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
                // Handles an edge case since a free game has the free download tag in the same element as the end date
                // on a deal, then pushes this data to the array. (Yes I know I could have used array.push in the other
                // scrapers but this was done after those and I'm not refactoring them now)
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
            } catch (e) {
                console.log(e);
            }
        }
    } else {
        // If only one game, use the whole parameter
        try {
            // Search for the game title and load all
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

            // Returns an array with all the data for every result
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
            // Much like the loop, handles in case if something doesn't actually have a deal going on
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
        } catch (e) {
            console.log(e);
        }
    }
    await browser.close();
    return data;
}

module.exports = {
    GetSteam,
    GetEpic,
    GetXbox,
    GetPlayStation,
    GetNintendo
};