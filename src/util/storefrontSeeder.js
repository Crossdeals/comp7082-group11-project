
const fs = require('fs');
const path = require('path');
const Storefront = require('../models/StorefrontModel');

// Seed Storefront collection with data from the storefront-seed.json

const seedStorefront = async () => {
    try {
        const filePath = path.join(__dirname, '..', 'data', 'storefront-seed.json');
        const seedData = fs.readFileSync(filePath);
        const jsonData = JSON.parse(seedData);
        const storefrontIdPrefix = "storefront_";
        for(let i = 0; i < jsonData.length; i++) {
            const store = jsonData[i];
            const existingStore = await Storefront.findOne({url: store.url});
            if(existingStore) {
                console.log(existingStore.name);
                continue;
            }
            console.log("adding new store");
            const storeId = storefrontIdPrefix + store.name.replace(/\s/g,"").toLowerCase();
            const newStore = new Storefront({_id: storeId, url: store.url, name: store.name, platforms: store.platforms});
            await newStore.save();
        }
    } catch(error) {
        console.error(`Error: ${error.message}`);
    } 
}

module.exports = seedStorefront;