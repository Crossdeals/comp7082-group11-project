const { expect } = require("chai");
const User = require("../../src/models/UserModel")
const mongoose = require("mongoose");

describe("User Model Unit Tests", () => {

    const seededUserName = "seeded";
    const testUserName = "user";
    const testPassword = "password";

    const createTestUser = async (name = testUserName, password = testPassword) => {
        return User.create({ userName: name, password: password });
    };

    before(async() => {
        await createTestUser(seededUserName)
    });

    after(async () => {
        await User.deleteMany({});
    });

    afterEach(async () => {
        await User.deleteMany({ userName: { $ne: seededUserName } });
    });

    it("should create and save a user with a hashed password", async () =>{
        await createTestUser();
        const count = await User.collection.countDocuments();
        expect(count).to.equal(2, "User collection should have 2 entries");
        const testUser = await User.findOne({ userName: testUserName });
        expect(testUser.userName).to.equal(testUserName, "User username not expected value");
        expect(testUser.password).to.not.equal(testPassword, "User password should be hashed");
        testUser.comparePassword(testPassword,(err, success) => {
            expect(success).to.equal(true, "User password not decrypting to expected value");
        });
    });

    it("should fail to create User if userName is empty", async () =>{ 
        let error;
        try {
            await createTestUser("");
        }
        catch(e) {
            error = e;
        }
        expect(error).instanceOf(mongoose.Error.ValidationError, "Mongoose validation error expected");
        const count = await User.collection.countDocuments();
        expect(count).is.equal(1, "User collection should not have added user with invalid username");
    });

    it("should fail to create User if password is empty", async () =>{ 
        let error;
        try {
            await createTestUser(testUserName, "");
        }
        catch(e) {
            error = e;
        }
        expect(error).instanceOf(mongoose.Error.ValidationError, "Mongoose validation error expected");
        const count = await User.collection.countDocuments();
        expect(count).is.equal(1, "User collection should not add user with invalid password");
    });

    it("should fail to create User if username not unique", async () =>{ 
        let error;
        try {
            await createTestUser(seededUserName);
        }
        catch(e) {
            error = e;
        }
        expect(error.code).to.equal(11000, "Mongodb duplicate key error not thrown");
        expect(error.message).to.include("duplicate key error", "Duplicate key error expected");
        const count = await User.collection.countDocuments();
        expect(count).is.equal(1, "User collection should not have added user with duplicate username");
    });
});