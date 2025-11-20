const { expect } = require("chai");
const VideoGame = require("../../src/models/VideoGameModel");
const mongoose = require("mongoose");

describe("VideoGame Model Unit Tests", () => {

    const testTitle = "test";
    const createDealInfo = function(originalPrice = 50, currentPrice = 50) {
        return { storefront: null, originalPrice: originalPrice, currentPrice: currentPrice }
    };

    afterEach(async () => {
        await VideoGame.deleteMany({});
    });

    it("should create and save VideoGame with title", async() =>{
        await VideoGame.createGameFromTitle(testTitle);
        const count = await VideoGame.countDocuments();
        expect(count).is.equal(1, "No videogame in collection");
        const testGame = await VideoGame.findByTitle(testTitle);
        expect(testGame.title).is.equal(testTitle, "Video game title does not match");
    });

    it("should fail to create VideoGame when no title passed in", async() =>{
        let error;
        try {
            await VideoGame.createGameFromTitle("");
        }
        catch(e) {
            error = e;
        }
        expect(error).instanceOf(mongoose.Error.ValidationError);
        const count = await VideoGame.countDocuments();
        expect(count).is.equal(0, "Videogame collection should be empty");
    });

    it("should fail to create VideoGame with non-unique title", async() =>{
        let error;
        try {
            await VideoGame.insertMany([{ title:testTitle }, { title:testTitle }]);
        }
        catch(e) {
            error = e;
        }
        expect(error.code).to.equal(11000);
        expect(error.message).to.include("duplicate key error");
        const count = await VideoGame.countDocuments();
        expect(count).is.equal(1, "Videogame collection should be empty");
    });

    it("should add valid DealInfo to VideoGame", async() =>{
        const testDealInfo = createDealInfo();
        testDealInfo.storefront = new mongoose.Types.ObjectId();
        const testGame = await VideoGame.createGameFromTitle(testTitle);
        testGame.deals.push(testDealInfo);
        await testGame.validate();
        expect(testGame.deals.length).is.equal(1, "Deal info was not added to game");
    });

    it("should not add DealInfo with no storeid to VideoGame", async() =>{
        let error;
        const testDealInfo = createDealInfo();
        const testGame = await VideoGame.createGameFromTitle(testTitle);
        try {
            await testGame.pushDealInfo(testDealInfo)
        }
        catch(e) {
            error = e;
        }
        expect(error).instanceOf(mongoose.Error.ValidationError);
        expect(testGame.deals.length).is.equal(0, "Invalid deal info was added to game");
    });

});