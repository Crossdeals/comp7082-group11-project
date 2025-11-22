const { expect } = require("chai");
const Storefront = require("../../src/models/StorefrontModel")
const mongoose = require("mongoose");

describe("Storefront Model Unit Tests", () => {

    afterEach(async () => {
        await Storefront.deleteMany({});
    });

    const testUrl = "test"
    const testName = "test";
    const testPlatforms = ["test"];


    const createTestStorefront = async (url = testUrl, name = testName, platforms = testPlatforms ) => {
        return Storefront.create({ url: url, name: name, platforms: platforms });
    };

    it("should create and save Storefront", async () =>{
        await createTestStorefront();
        const count = await Storefront.collection.countDocuments();
        expect(count).to.equal(1, "Storefront collection should have 1 entry");
        const testStore = await Storefront.findOne({ url: testUrl });
        expect(testStore.url).to.equal(testUrl, "Storefront url not expected value");
        expect(testStore.name).to.equal(testName, "Storefront name not expected value");
    });

    it("should fail to create Storefront if url is empty", async () =>{ 
        let error;
        try {
            await createTestStorefront("");
        }
        catch(e) {
            error = e;
        }
        expect(error).instanceOf(mongoose.Error.ValidationError, "Mongoose validation error expected");
        const count = await Storefront.collection.countDocuments();
        expect(count).is.equal(0, "Storefront collection should be empty");
    });

    it("should fail to create Storefront if name is empty", async () =>{ 
        let error;
        try {
            await createTestStorefront(testUrl, "");
        }
        catch(e) {
            error = e;
        }
        expect(error).instanceOf(mongoose.Error.ValidationError, "Mongoose validation error expected");
        const count = await Storefront.collection.countDocuments();
        expect(count).is.equal(0, "Storefront collection should be empty");
    });

    it("should fail to create Storefront if platforms is empty", async () =>{ 
        let error;
        try {
            await createTestStorefront(testUrl, testName, []);
        }
        catch(e) {
            error = e;
        }
        expect(error).instanceOf(mongoose.Error.ValidationError, "Mongoose validation error expected");
        const count = await Storefront.collection.countDocuments();
        expect(count).is.equal(0, "Storefront collection should be empty");
    });
  
});