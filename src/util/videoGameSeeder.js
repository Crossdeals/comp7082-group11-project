const Storefront = require('../models/StorefrontModel');
const VideoGame = require('../models/VideoGameModel');

const gameTitles = [
    "Minecraft",
    "Starcraft",
    "Warcraft",
    "Risk of Rain 2",
    "Heavy Rain",
    "Monster Train 2",
    "Slay the Spire",
    "Monster Hunter World",
    "Monster Hunter Rise"
]

const dealDataTemplate = {
    storefront: null,
    originalPrice: 0,
    currentPrice: 0,
    bestPrice: 0,
    dealEndDate: null
}

const seedVideoGames = async () => {
    
    
    try {
        await VideoGame.deleteMany({});
        const store = await Storefront.findOne({});
        if(!store) {
            throw new Error("No storefront found, please seed the Storefront document");
        }
        await seedGames();
    
    } catch(error) {
        console.error(`Error: ${error.message}`);
    }
}

module.exports = seedVideoGames;

const seedGames = async function() {
    const storeCount = await Storefront.countDocuments();
    
    for(let i = 0; i < gameTitles.length; i++) {
        const randomInt = Math.floor( Math.random() * storeCount + 1);
        const randomStores = await Storefront.aggregate([{ $sample: { size: randomInt}}])
        const dealInfoList = generateRandomDealData(randomStores);
        const newGame = new VideoGame({title: gameTitles[i]});
        newGame.deals = dealInfoList;
        newGame.markModified("deals");
        await newGame.save();
    }
}

const generateRandomDealData = function(randomStores) {
    const dealInfo = [];
    for(let i = 0; i < randomStores.length; i++) {
        const dealData = { ...dealDataTemplate};
        dealData.storefront = randomStores[i]._id;
        const originalPrice = Math.random() * 80 + 20;
        const currentPrice = Math.random() * originalPrice + 1;
        dealData.originalPrice = originalPrice.toFixed(2);
        dealData.currentPrice = currentPrice.toFixed(2);
        dealData.bestPrice = dealData.currentPrice;
        const randomDay = Math.floor(Math.random() * 31 + 1);
        dealData.dealEndDate = "2025-12-" + (randomDay < 10 ? "0": "" ) + randomDay;
        dealInfo.push(dealData);
    }
    return dealInfo;
}

