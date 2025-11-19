const { expect } = require("chai");
const User = require("../../src/models/UserModel")

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

});