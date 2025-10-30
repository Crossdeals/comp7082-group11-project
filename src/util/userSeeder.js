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

const seedUsers = async () => {
    try {
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

            for await( const game of VideoGame.find()) {
                console.log("adding game" + game.title);
                await Wishlist.updateOne({ _id: wishList._id },
                    {
                        '$push': {
                            games: game._id
                        }
                    }
                );
            }
        }
    
    } catch(error) {
        console.error(`Error: ${error.message}`);
    }
}

module.exports = seedUsers;