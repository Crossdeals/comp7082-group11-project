const request = require("supertest");
const app = require("../../src/app");
const User = require("../../src/models/UserModel");
const Wishlist = require("../../src/models/WishlistModel");
const VideoGame = require("../../src/models/VideoGameModel");
const Storefront = require("../../src/models/StorefrontModel");
const mongoose = require("mongoose");

describe("Wishlist Controller Tests", function() {

    this.timeout(5000);
    const testName = "test";
    const testPassword = "test"
    const testRootPath = "/wishlist";
    let agent;
    let testGame;
    let testGameId;
    let testStoreId;

    before(async () => {
        agent = request.agent(app);
        await agent
            .post("/signup")
            .type("form")
            .send({ username: testName, password: testPassword })
    });

    before(async () => {
        testGame = await VideoGame.createGameFromTitle(testName);
        testGameId = testGame._id;
        const testStore = await Storefront.create({ _id: "testId", url: "testUrl", name: testName, platforms: [testName] });
        testStoreId = testStore._id;
    });

    after(async () => {
        await VideoGame.deleteMany({});
        await Wishlist.deleteMany({});
        await User.deleteMany({});
        await Storefront.deleteMany({})
    });

    beforeEach(async () => {
        const user = await User.findByUserName(testName);
        const newList = await Wishlist.create( {} );

        newList.preferredStores = [ testStoreId ];
        newList.games = [ testGameId ];
        newList.markModified("preferredStores");
        newList.markModified("games");
        await newList.save();
        user.wishlist = newList._id;
        await user.save(); 
    })

    afterEach(async () => {
        await Wishlist.deleteMany({});
        await VideoGame.deleteMany({ title: { $ne: testName} });
    });

    it("should get wishlist from index when authenticated", async() => {
        const testPath = testRootPath + "/index";
        await agent
        .get(testPath)
        .expect(200);
    });

    it("should not remove game from wishlist when gameid is not a valid objectid type", async() => {
        const randomId = "invalid id";
        const testPath = testRootPath + "/remove/" + randomId;
        await agent
        .delete(testPath)
        .expect(404)
        .expect({ message: "Paramter is not an id" });
    });

    it("should not remove game from wishlist when gameid not found", async() => {
        const randomId = new mongoose.Types.ObjectId();
        const testPath = testRootPath + "/remove/" + randomId;
        await agent
        .delete(testPath)
        .expect(404)
        .expect({ message: "Game not found" });
    });

    it("should remove game from wishlist when gameid found", async() => {
        const testPath = testRootPath + "/remove/" + testGameId;
        await agent
        .delete(testPath)
        .expect(200)
        .expect({ message: "Game removed" });
    });

    it("should not add duplicate game to wishlist", async() => {
        const testPath = testRootPath + "/add";
        await agent
        .post(testPath)
        .send({ title: testName })
        .expect(400)
        .expect({ message: "Game already in wishlist" });
    });

    it("should add new game to wishlist", async() => {
        const newGame = "new game"
        const testPath = testRootPath + "/add";
        await agent
        .post(testPath)
        .send({ title: newGame })
        .expect(200)
        .expect({ message: "Game added" });
    });

    it("should return error if no storefront information during patch", async() => {
        const randomStoreId = "randomId";
        const testPath = testRootPath + "/storefront";
        await agent
        .patch(testPath)
        .send({ stores: [randomStoreId] })
        .expect(404)
        .expect({ message: "No valid stores to update" });
    });

    it("should not update preferred stores if no change", async() => {
        const testPath = testRootPath + "/storefront";
        await agent
        .patch(testPath)
        .send({ stores: [testStoreId] })
        .expect(200)
        .expect({ message: "No changes to preferred stores" });
    });

    it("should update preferred stores if different from current", async() => {
        const testPath = testRootPath + "/storefront";
        await agent
        .patch(testPath)
        .send({ stores: [] })
        .expect(200)
        .expect({ message: "Preferred stores updated" });
    });

    it("should send the users preferred storefronts", async() => {
        const testPath = testRootPath + "/storefront";
        const res = await agent
        .get(testPath)
        .expect(200)
        .expect("Content-Type", /json/);
    });

});