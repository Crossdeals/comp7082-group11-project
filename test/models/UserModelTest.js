const { expect } = require("chai");
const User = require("../../src/models/UserModel")
const mongoose = require("mongoose");

describe("User Model Unit Tests", () => {

    afterEach(async () => {
        await User.deleteMany({});
    });

    const testUserName = "user";
    const testPassword = "password";
    const createTestUser = async (name = testUserName, password = testPassword) => {
        return User.create({ userName: name, password: password });;
    };

    it("should create and save a user with a hashed password", async () =>{
        await createTestUser();
        const count = await User.collection.countDocuments();
        expect(count).to.equal(1);
        const testUser = await User.findOne({ userName: testUserName });
        expect(testUser.userName).to.equal(testUserName);
        expect(testUser.password).to.not.equal(testPassword);
        testUser.comparePassword(testPassword,(err, success) => {
            expect(success).to.equal(true);
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
        expect(error).instanceOf(mongoose.Error.ValidationError);
        const count = await User.collection.countDocuments();
        expect(count).is.equal(0);
    });

    it("should fail to create User if password is empty", async () =>{ 
        let error;
        try {
            await createTestUser(testUserName, "");
        }
        catch(e) {
            error = e;
        }
        expect(error).instanceOf(mongoose.Error.ValidationError);
        const count = await User.collection.countDocuments();
        expect(count).is.equal(0);
    });

    it("should fail to create User if username not unique", async () =>{ 
        const usersToInsert = [
            { userName: testUserName, password: testPassword },
            { userName: testUserName, password: testPassword }
        ]
        let error;
        try {
            await User.insertMany(usersToInsert);
        }
        catch(e) {
            error = e;
        }
        expect(error.code).to.equal(11000);
        expect(error.message).to.include("duplicate key error");
        const count = await User.collection.countDocuments();
        expect(count).is.equal(1);
    });
});