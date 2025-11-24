const Storefront = require('../models/StorefrontModel');
const User = require('../models/UserModel');
const VideoGame = require('../models/VideoGameModel');
const Wishlist = require('../models/WishlistModel');

const maxTestUsers = 10;
const testPrefix = "test";

const seedUsers = async () => {
    try {
        await Wishlist.deleteMany({});
        await User.deleteMany({});

        const storeIds = await Storefront.distinct('_id');
        const videoGameCount = await VideoGame.countDocuments();
        if(storeIds.length == 0) {
            throw new Error("no stores");
        }

        for(let i = 0; i < maxTestUsers; i++) {
            const testUserName = testPrefix + i;
            
            const newUser = new User({ userName: testUserName, password: testUserName });

            const wishList = await Wishlist.create({ preferredStores: storeIds });
            newUser.wishlist = wishList._id;
            await newUser.save();

            const randomInt = Math.floor( Math.random() * videoGameCount + 1);
            const randomGames = await VideoGame.aggregate([{ $sample: { size: randomInt}}])

            for ( const game of randomGames) {
                console.log("adding game " + game.title);
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