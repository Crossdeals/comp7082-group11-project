const request = require("supertest");
const app = require("../../src/app");
const VideoGame = require("../../src/models/VideoGameModel");
const Storefront = require("../../src/models/StorefrontModel");
const { expect } = require("chai");

describe("Games Controller Tests", function() {
    const testGameOne = "game1";
    const testGameTwo = "game2";
    let testGameOneId;
    let testGameTwoId;

    this.timeout(5000);

    const createTestGame = async function(title, originalPrice, currentPrice, storeId) {

        const testGame = new VideoGame({ title: title});
        testGame.deals = 
        [{
            storefront: storeId,
            originalPrice: originalPrice,
            currentPrice: currentPrice
        }];
        await testGame.save();
        return testGame._id;;
    };

    before(async () => {
        const testStore = await Storefront.create({ url: "testUrl", name: "test", platforms: ["test"] });
        testGameOneId = await createTestGame(testGameOne, 50, 25, testStore._id);
        testGameTwoId = await createTestGame(testGameTwo, 40, 20, testStore._id);
    });

    after(async () => {
        await VideoGame.deleteMany({});
        await Storefront.deleteMany({});
    });

    it("should get all game deals", async() => {
        const testPath = "/games";
        const response = await request(app)
        .get(testPath)
        .expect(200)
        expect(Array.isArray(response.body), "/games should send an array").to.be.true;
        expect(response.body.length).is.equal(2, "Videogame collection should only have 2 games");
    });
});