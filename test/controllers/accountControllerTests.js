const request = require("supertest");
const app = require("../../src/app");
const User = require("../../src/models/UserModel");
const { expect } = require("chai");
const mongoose = require("mongoose");

describe("Account Controller Tests", () =>{

    const testName = "test";
    const testPassword = "test"
    let agent;

    before(async () => {
        await User.create( {userName: testName, password: testPassword});
    });

    before(async () => {
        agent = request.agent(app);
        await agent
            .post("/login")
            .type("form")
            .send( { username: testName, password: testPassword } )
            .expect(200)
            .expect({message: "Login ok"});
    });

    after(async () => {
        await User.deleteMany( {} );
    });

    it("should fail signup if password is missing", async () => {
        const response = await request(app)
            .post("/signup")
            .type("form")
            .send( { username: testName } )
            .expect(403)
            .expect({message: "Missing username or password"});
    });

    it("should fail signup if username is misssing", async () => {
        const response = await request(app)
            .post("/signup")
            .type("form")
            .send( { password: testPassword } )
            .expect(403)
            .expect({message: "Missing username or password"});
    });

    it("should fail signup if username is alredy in use", async () => {
        const response = await request(app)
            .post("/signup")
            .type("form")
            .send( { username: testName, password: testPassword } )
            .expect(409)
            .expect({message: "User already exists"});
    });

    it("should succeed signup with valid username and password", async () => {
        const newName = "newUser";
        
        const response = await request(app)
            .post("/signup")
            .type("form")
            .send( { username: newName, password: testPassword } )
            .expect(200)
            .expect({message: "User created"});

        const newUser = await User.findOne({ userName: newName });
        const validId = mongoose.isValidObjectId(newUser.wishlist);
        expect(validId, "User wishlist should be initialized").to.be.true;
    });

    it("should fail login with invalid password", async () => {
        const response = await request(app)
            .post("/login")
            .type("form")
            .send( { username: testName, password: "" } )
            .expect(403)
            .expect({message: "Password does not match"});
    });

    it("should fail login with invalid user", async () => {
        const noExistUser = "fake";
        const response = await request(app)
            .post("/login")
            .type("form")
            .send( { username: "fake", password: "" } )
            .expect(403)
            .expect({message: "User does not exist"});
    });

    it("should fail token verification if invalid username", async () => {
        const response = await agent
            .post("/username")
            .send( { username: "fake" } )
            .expect(403)
            .expect({message: "Token verification failed"});
    });

    it("should succeed token verification with valid username", async () => {
        const response = await agent
            .post("/username")
            .send( { username: testName } )
            .expect(200)
            .expect({username: testName});
    });

});