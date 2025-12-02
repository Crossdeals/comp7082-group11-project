const request = require("supertest");
const app = require("../../src/app");
const User = require("../../src/models/UserModel");
const Wishlist = require("../../src/models/WishlistModel");
const VideoGame = require("../../src/models/VideoGameModel");
const Storefront = require("../../src/models/StorefrontModel");
const { expect } = require("chai");

describe("New User Functional Tests", function() {
    
    this.timeout(5000);
    const testName = "test";
    const testPassword = "test"
    const testStore1 = "testStore01";
    const testStore2 = "testStore02";
    const testGame1 = "testgame1";
    const testGame2 = "testgame2";
    const testStoreIds = [];
    const testGames = [];

    const createTestStore = async function(storeName) {
        const testStore = await Storefront.create({ _id: storeName, url: storeName, name: storeName, platforms: [storeName] });
        return testStore._id;
    }

    const createTestGame = async function(gameName, storeId) {
        const game = new VideoGame({title:gameName, deals:[]});
        game.deals.push({ storefront: storeId, originalPrice: 0, currentPrice: 0} );
        await game.save();
        return game;
    }

    before(async () => {
        testStoreIds.push(await createTestStore(testStore1));
        testStoreIds.push(await createTestStore(testStore2));
        testGames.push(await createTestGame(testGame1, testStoreIds[0]));
        testGames.push(await createTestGame(testGame2, testStoreIds[1]));
    });

    after(async () => {
        await VideoGame.deleteMany({});
        await Wishlist.deleteMany({});
        await User.deleteMany({});
        await Storefront.deleteMany({})
    });

    afterEach(async () => {
        await Wishlist.deleteMany({});
        await User.deleteMany({});
    });

    const validateGamesResponse = function(games, expectedLength, hasIsWishlisted, expectIsWishlisted = undefined) {
        expect(games).to.be.an("array");
        expect(games.length).to.be.equal(expectedLength);
        expect(Object.hasOwn(games[0], "isWishlisted")).to.be.equal(hasIsWishlisted);
        if(hasIsWishlisted) {
            let isWishlisted = false;
            for(let i = 0; i < games.length; i++) {
                if (games[i].isWishlisted) {
                    isWishlisted = true;
                }
            };
            expect(expectIsWishlisted).to.be.equal(isWishlisted);
        }
    }

    const validateWishlistResponse = function(wishlist, expectedLength, expectedGameTitle = undefined) {
        expect(wishlist).to.be.an("array");
        expect(wishlist.length).to.be.equal(expectedLength);
        if(expectedLength > 0) {
            expect(wishlist[0].title).to.be.equal(expectedGameTitle);
        } 
    }

    const validateWishlistStorefrontResponse = function(storeList, expectedLength, expectedIds) {
        expect(storeList.length).to.be.equal(expectedLength);
        for(let i = 0; i < storeList.length; i++) {
            expect(expectedIds.includes(storeList[i])).to.be.true;
        }
    }

    it("should send game list with appropriate data on request, signup user on request, send wishlist on request, and update wishlist on request", async () => {
        let response;
        const testGame = testGames[0];
        response = await request(app)
            .get("/games")
            .expect(200);

        validateGamesResponse(response.body, 2, false);

        const agent = request.agent(app);
        await agent
            .post("/signup")
            .type("form")
            .send({ username: testName, password: testPassword })
            .expect(200)

        response = await agent
            .get("/wishlist/index")
            .expect(200);

        validateWishlistResponse(response.body, 0);

        response = await agent
            .get("/games")
            .expect(200);

        validateGamesResponse(response.body, 2, true, false);

        response = await agent
            .post("/wishlist/add")
            .send({ title: testGame.title })
            .expect(200);

        response = await agent
            .get("/wishlist/index")
            .expect(200);

        validateWishlistResponse(response.body, 1, testGame.title);

        response = await agent
            .get("/games")
            .expect(200);

        validateGamesResponse(response.body, 2, true, true);

        response = await agent
            .delete("/wishlist/remove/" + testGame._id)
            .expect(200);

        response = await agent
            .get("/wishlist/index")
            .expect(200);

        validateWishlistResponse(response.body, 0);

        response = await agent
            .get("/games")
            .expect(200);

        validateGamesResponse(response.body, 2, true, false);
    });

     it("should send preferred stores correctly after update and games sent should respect preferred stores", async () => {
        let response;

        const agent = request.agent(app);
        await agent
            .post("/signup")
            .type("form")
            .send({ username: testName, password: testPassword })
            .expect(200)

        response = await agent
            .get("/wishlist/storefront")
            .expect(200);

        validateWishlistStorefrontResponse(response.body, 2, testStoreIds);

        response = await agent
            .get("/games")
            .expect(200);

        validateGamesResponse(response.body, 2, true, false);

        const newStoreList = [testStoreIds[0]]

        response = await agent
            .patch("/wishlist/storefront")
            .send({ stores: newStoreList})
            .expect(200)

        response = await agent
            .get("/wishlist/storefront")
            .expect(200);

        validateWishlistStorefrontResponse(response.body, 1, newStoreList);

        response = await agent
            .get("/games")
            .expect(200);

        validateGamesResponse(response.body, 1, true, false);
    });

    it("should persist and send correct data for existing users", async () => {
        let response;

        const agent = request.agent(app);
        await agent
            .post("/signup")
            .type("form")
            .send({ username: testName, password: testPassword })
            .expect(200)

        response = await agent
            .get("/wishlist/index")
            .expect(200);

        validateWishlistResponse(response.body, 0);

        response = await agent
            .post("/wishlist/add")
            .send({ title: testGame1 })
            .expect(200);

        response = await agent
            .get("/wishlist/index")
            .expect(200);

        validateWishlistResponse(response.body, 1, testGame1);

        response = await agent
            .get("/logout")
            .expect(200);

        response = await agent
            .get("/wishlist/index")
            .expect(403);

        await agent
            .post("/login")
            .type("form")
            .send({ username: testName, password: testPassword })
            .expect(200)

        response = await agent
            .get("/wishlist/index")
            .expect(200);

        validateWishlistResponse(response.body, 1, testGame1);
    });
});