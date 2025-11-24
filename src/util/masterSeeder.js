const connectDB = require('../config/db');
const mongoose = require('mongoose');
const StorefrontSeeder = require('./storefrontSeeder');
const UserSeeder = require('./userSeeder');
const VideoGameSeeder = require('./videoGameSeeder');
const Storefront = require('../models/StorefrontModel');


require('dotenv').config();

const seedData = async () => {
    try {
        await connectDB();
        await Storefront.deleteMany({});
        await StorefrontSeeder();
        await VideoGameSeeder();
        await UserSeeder();
    } catch(error) {
        console.error(`Error: ${error.message}`);
    } finally {
        mongoose.connection.close();
    }
}

seedData();