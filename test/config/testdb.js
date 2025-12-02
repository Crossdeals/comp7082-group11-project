const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Test database config file to set up in memory database

let mongoServer;

exports.connectTestDB = async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
}

exports.disconnectTestDB = async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
}