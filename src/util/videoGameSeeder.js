const Storefront = require('../models/StorefrontModel');
const VideoGame = require('../models/VideoGameModel');

const seedData = [
    {
        title: "Minecraft",
        deals: [
            {
                storefront: null,
                originalPrice: 99.99,
                currentPrice: 59.99,
                bestPrice: 39.99,
                dealEndDate: "2025-11-11"
            }
        ]
    },
    {
        title: "Starcraft",
        deals: [
            {
                storefront: null,
                originalPrice: 29.99,
                currentPrice: 29.99
            }
        ]
    }
];

const seedVideoGames = async () => {
    try {
        const store = await Storefront.findOne({});
        if(!store) {
            throw new Error("No storefront found, please seed the Storefront document");
        }
        for (let i = 0; i < seedData.length; i++) {
            let game = seedData[i];
            let deal = game.deals[0];
            deal.storefront = store._id;
            foundGame = await VideoGame.findOne({title: game.title});
            if(foundGame) {
                console.log("skipping game");
                continue;
            }
            console.log("creating new game");
            const newGame = new VideoGame({title: game.title});
            newGame.deals.push({
                storefront: deal.storefront,
                originalPrice: deal.originalPrice,
                currentPrice: deal.currentPrice,
                bestPrice: deal?.bestPrice,
                dealEndDate: deal?.dealEndDate
            });
            await newGame.save();
    }
    } catch(error) {
        console.error(`Error: ${error.message}`);
    }
}

module.exports = seedVideoGames;

