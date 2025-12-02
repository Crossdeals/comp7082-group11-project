const app = require('./app');
const StorefrontSeeder = require('./util/storefrontSeeder');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 3000;

// File to start the Crossdeals backend server

connectDB();
StorefrontSeeder();

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

