const {expect} = require("chai");
const scraper = require("../scraper.js");

describe("Web scraper unit tests", async () => {
    // Test Steam getting a price from a paid game
    it("should return a price from the SteamAPI", async () => {
        var price = await scraper.GetSteam("2807960");
        expect(price).to.notEqual(null);
        expect(price).to.notEqual(0);
    });

    // Test Steam getting a free game
    it("should return free from the SteamAPI", async () => {
        var price = await scraper.GetSteam("730");
        expect(price).to.equal(0);
    });

    // Test Epic getting price data from a paid game
    it("should return a price from EGS", async () => {
        var gameData = await scraper.GetEpic("Satisfactory");
        expect(gameData).to.equal(!null);
        expect(gameData["Title"]).to.equal("Satisfactory");
        expect(gameData["OriginalPrice"]).to.equal(51.99);
        expect(gameData["DiscountPrice"]).to.notEqual(null);
        expect(gameData["DiscountPerc"]).to.notEqual(null);
        expect(gameData["EndDate"]).to.equal(null);
    });

    // Test Epic getting a free game
    it("should return free from EGS", async () => {
        var gameData = await scraper.GetEpic("Rocket League");
        expect(gameData).to.equal(!null);
        expect(gameData["Title"]).to.equal("Rocket League");
        expect(gameData["OriginalPrice"]).to.equal(0);
        expect(gameData["DiscountPrice"]).to.equal(0);
        expect(gameData["DiscountPerc"]).to.equal("0%");
        expect(gameData["EndDate"]).to.equal(null);
    });

    // Test Xbox getting price data from a paid game
    it("should return a price from Xbox", async () => {
        var gameData = await scraper.GetXbox("Minecraft");
        gameData.foreach(obj => {
            expect(obj["Title"]).to.include("Minecraft");
            expect(obj["OriginalPrice"]).to.notEqual(null);
            expect(obj["DiscountPrice"]).to.notEqual(null);
            expect(obj["DiscountPerc"]).to.notEqual(null);
        });
    });

    // Test Xbox getting a free game
    it("should return free from Xbox", async () => {
        var gameData = await scraper.GetXbox("Fortnite");
        gameData.foreach(obj => {
            expect(obj["Title"]).to.include("Fortnite");
            expect(obj["OriginalPrice"]).to.equal(0);
            expect(obj["DiscountPrice"]).to.equal(0);
            expect(obj["DiscountPerc"]).to.equal("0%");
        });
    });

    // Test PlayStation getting price data from a paid game
    it("should return a price from PlayStation", async () => {
        var gameData = await scraper.GetPlayStation("God of War");
        gameData.foreach(obj => {
            expect(obj["Title"]).to.include("God of War");
            expect(obj["OriginalPrice"]).to.notEqual(null);
            expect(obj["DiscountPrice"]).to.notEqual(null);
            expect(obj["DiscountPerc"]).to.notEqual(null);
            expect(obj["EndDate"]).to.notEqual(null);
        });
    });

    // Test PlayStation getting a free game
    it("should return free from PlayStation", async () => {
        var gameData = await scraper.GetPlayStation("Warframe");
        gameData.foreach(obj => {
            expect(obj["Title"]).to.include("Warframe");
            expect(obj["OriginalPrice"]).to.equal(0);
            expect(obj["DiscountPrice"]).to.equal(0);
            expect(obj["DiscountPerc"]).to.equal("0%");
            expect(obj["EndDate"]).to.equal(null);
        });
    });

    // Testing Nintendo getting price data from a paid game
    it("should return a price from Nintendo", async () => {
        var gameData = await scraper.GetNintendo("Mario Kart 8");
        gameData.foreach(obj => {
            expect(obj["Title"]).to.include("Mario Kart");
            expect(obj["OriginalPrice"]).to.notEqual(null);
            expect(obj["DiscountPrice"]).to.notEqual(null);
            expect(obj["DiscountPerc"]).to.notEqual(null);
            expect(obj["EndDate"]).to.equal(null);
        });
    });

    // Testing Nintendo getting a free game
    it("should return free from Nintendo", async () => {
        var gameData = await scraper.GetNintendo("Tetris");
        gameData.foreach(obj => {
            expect(obj["Title"]).to.include("Tetris");
            expect(obj["OriginalPrice"]).to.equal(0);
            expect(obj["DiscountPrice"]).to.equal(0);
            expect(obj["DiscountPerc"]).to.equal("0%");
            expect(obj["EndDate"]).to.equal(null);
        });
    })
});

describe("Web scraper functional tests", async () => {
    // Testing Steam getting multiple games
    it("Steam should return a price for multiple different games", async () => {
        let allData = [];
        let ids = ["10","620980","3949040","1361210","1133870"];
        for (let i = 0; i < 5; i++ ) {
            allData[i] = await scraper.GetSteam(ids[i]);
        }
        allData.foreach(price => {
            expect(price).to.notEqual(null);
        });
    });

    // Testing Epic getting multiple games
    it("EGS should return a price for multiple different games", async () => {
        var gameData = await scraper.GetEpic(["Satisfactory", "Rocket League", "Grand Theft Auto V", "Battlefield 6", "Fortnite"], 5);
        gameData.foreach(obj => {
            expect(obj).to.notEqual(null);
            console.log(obj);
        })
    });

    // Testing Xbox getting multiple games
    it("Xbox should return a price for multiple different games", async () => {
        var gameData = await scraper.GetXbox(["Minecraft", "Halo", "Grand Theft Auto", "Battlefield", "Call of Duty"], 5);
        gameData.foreach(obj => {
            expect(obj).to.notEqual(null);
            console.log(obj);
        });
    });

    // Testing PlayStation getting multiple games
    it("PlayStation should return a price for multiple different games", async () => {
        var gameData = await scraper.GetPlayStation(["Minecraft", "Helldivers 2", "Grand Theft Auto", "God of War", "Warframe"], 5);
        gameData.foreach(obj => {
            expect(obj).to.notEqual(null);
            console.log(obj);
        });
    });

    // Testing Nintendo getting multiple games
    it("Nintendo should return a price for multiple different games", async () => {
        var gameData = await scraper.GetNintendo(["Minecraft", "Mario Kart", "Kirby", "Super Smash Bros", "Tetris"], 5);
        gameData.foreach(obj => {
            expect(obj).to.notEqual(null);
            console.log(obj);
        });
    });
});