const request = require("supertest");
const app = require("../../src/app");
const VideoGame = require("../../src/models/VideoGameModel");
const Storefront = require("../../src/models/StorefrontModel");
const { expect } = require("chai");
const mongoose = require("mongoose");

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

    beforeEach(async () => {
        const testStore = await Storefront.create({ url: "testUrl", name: "test", platforms: ["test"] });
        testGameOneId = await createTestGame(testGameOne, 50, 25, testStore._id);
        testGameTwoId = await createTestGame(testGameTwo, 40, 20, testStore._id);
    });

    afterEach(async () => {
        await VideoGame.deleteMany({});
        await Storefront.deleteMany({});
    });

    it("should get all game deals", async() => {
        const testPath = "/games";
        const response = await request(app)
        .get(testPath)
        .expect(200);
        expect(Array.isArray(response.body), "/games should send an array").to.be.true;
        expect(response.body.length).is.equal(2, "Videogame collection should only have 2 games");
    });

    it("should not return game info if parameter is not an object id", async() => {
        const invalidId = "invalid id"
        const testPath = "/games/" + invalidId.toString();
        await request(app)
        .get(testPath)
        .expect(404)
        .expect({ message: "Paramter is not an id" });
    });

    it("should not return game info if invalid game id", async() => {
        const invalidId = new mongoose.Types.ObjectId();
        const testPath = "/games/" + invalidId.toString();
        await request(app)
        .get(testPath)
        .expect(404)
        .expect({ message: "Invalid game id" });
    });

    it("should return game info if valid game id", async() => {
        const testPath = "/games/" + testGameOneId.toString();
        const response = await request(app)
        .get(testPath)
        .expect(200);

        expect(response.body.title).is.equal(testGameOne);
    });

    it("should not return game details if no game titles similar to query", async() => {
        const title = "Minecraft";
        const testPath = "/games/search?title=" + title; 
        await request(app)
        .get(testPath)
        .expect(404)
        .expect({ message: "No games found" });
    });

    it("should return game deals if game titles similar to query is found", async() => {
        const title = "game";
        const testPath = "/games/search?title=" + title;
        const response = await request(app)
        .get(testPath)
        .expect(200);

        expect(Array.isArray(response.body), "/games should send an array").to.be.true;
        expect(response.body.length).is.equal(2, "Videogame title search should return 2 games");
    });

    it("should return the featured game", async() => {
        const testPath = "/games/featured"
        const response = await request(app)
        .get(testPath)
        .expect(200);
    });

    it("should return error if no game to feature", async() => {
        await VideoGame.deleteMany({});
        const testPath = "/games/featured"
        const response = await request(app)
        .get(testPath)
        .expect(404)
        .expect({ message: "No featured game found" });
    });
});