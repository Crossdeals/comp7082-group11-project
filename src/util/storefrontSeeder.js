const connectDB = require('../config/db');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const Storefront = require('../models/StorefrontModel');

require('dotenv').config();
connectDB();

const seedStorefront = async () => {
    try {
        const filePath = path.join(__dirname, '..', 'data', 'storefront-seed.json');
        const seedData = fs.readFileSync(filePath);
        const jsonData = JSON.parse(seedData);
        
        for(let i = 0; i < jsonData.length; i++) {
            const store = jsonData[i];
            const existingStore = await Storefront.findOne({url: store.url});
            if(existingStore) {
                console.log(existingStore.name);
                continue;
            }
            console.log("adding new store");
            const newStore = new Storefront({url: store.url, name: store.name, platforms: store.platforms});
            await newStore.save();
        }
    } catch(error) {
        console.error(`Error: ${error.message}`);
    } finally {
        mongoose.connection.close();
    }
}

seedStorefront();