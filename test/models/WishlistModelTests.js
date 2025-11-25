const { expect } = require("chai");
const Wishlist = require("../../src/models/WishlistModel");
const VideoGame = require("../../src/models/VideoGameModel");
const mongoose = require("mongoose");

const testName = "test";

describe("Wishlist Model Unit Tests", () => {

    after(async () => {
        Wishlist.deleteMany({});
        VideoGame.deleteMany({});
    });

    it("should save video game as object id", async() =>{
        const testList = await Wishlist.create({ preferredStores: [], games: []});
        const testGame = await VideoGame.createGameFromTitle(testName);
        testList.games.push(testGame);
        testList.markModified("games");
        await testList.save();
        const listCopy = await Wishlist.findById(testList._id);
        expect(mongoose.Types.ObjectId.isValid(listCopy.games[0])).to.be.true;
    });
});