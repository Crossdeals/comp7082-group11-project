const { connectTestDB, disconnectTestDB } = require("./config/testdb");

// File to setup test database before the tests have run and teardown after all tests have run

before(async() => {
    await connectTestDB();
});

after(async()=>{
    await disconnectTestDB();
});