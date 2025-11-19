const { connectTestDB, disconnectTestDB } = require("./config/testdb");

before(async() => {
    await connectTestDB();
});

after(async()=>{
    await disconnectTestDB();
});