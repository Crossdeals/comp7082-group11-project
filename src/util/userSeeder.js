const connectDB = require('../config/db');
const mongoose = require('mongoose');
const Storefront = require('../models/StorefrontModel');
const User = require('../models/UserModel');
const VideoGame = require('../models/VideoGameModel');
const Wishlist = require('../models/WishlistModel');
const bcrypt = require("bcrypt");

seedData = [
    {
        userName: "test01",
        password: "test01"
    },
    {
        userName: "test02",
        password: "test02"
    },
    {
        userName: "test03",
        password: "test03"
    }
];

require('dotenv').config();

const seedUsers = async () => {
    try {
        connectDB();
        const storeIds = await Storefront.distinct('_id');
        if(storeIds.length == 0) {
            throw new Error("no stores");
        }

        for(let i = 0; i < seedData.length; i++) {
            const user = seedData[i];
            const existingUser = await User.findOne({ userName: user.userName });
            if(existingUser) {
                console.log(`User ${user.userName} exists`);
                continue;
            }
            
            let newUser = new User({ userName: user.userName, password: user.password });

            const wishList = await Wishlist.create({ preferredStores: storeIds });
            newUser.wishlist = wishList._id;
            await newUser.save();
        }
    
    } catch(error) {
        console.error(`Error: ${error.message}`);
    } finally {
        mongoose.connection.close();
    }
}

seedUsers();