const Storefront = require('../models/StorefrontModel');
const VideoGame = require('../models/VideoGameModel');

const gameInfo = [
    { title: "Minecraft", publisher: "Mojang Studios", year: 2011,
        description: "Minecraft is a sandbox game developed and published by Mojang Studios. Formally released on 18 November 2011 for personal computers following its initial public alpha release on 17 May 2009, it has been ported to numerous platforms, including mobile devices and various video game consoles."},
    { title: "Starcraft", publisher: "Blizzard Entertainment", year: 1998,
        description: "StarCraft is a real-time strategy video game developed and published by Blizzard Entertainment for Microsoft Windows. The first installment of the video game series of the same name, it was released in 1998. A Classic Mac OS version was released in 1999, and a Nintendo 64 port co-developed with Mass Media and published by Nintendo was released in 2000."},
    { title: "Warcraft: Orcs & Humans", publisher: "Blizzard Entertainment", year: 1994,
        description: "Warcraft: Orcs & Humans is a real-time strategy game (RTS) developed and published by Blizzard Entertainment, and published by Interplay Productions in Europe. It was released for MS-DOS in North America on November 15, 1994, and for Mac OS in early 1996. The MS-DOS version was re-released by Sold-Out Software in 2002. It is considered the first game in the Warcraft fantasy game franchise."},
    { title: "Risk of Rain 2", publisher: "Gearbox Publishing", year: 2020,
        description: "Risk of Rain 2 is a roguelite third-person shooter developed by Hopoo Games and published by Gearbox Publishing. A sequel to 2013's Risk of Rain, it was released in early access for Microsoft Windows, Nintendo Switch, PlayStation 4, and Xbox One in 2019 before fully releasing in August 2020 with a release for Stadia coming a month later. Versions for PlayStation 5 and Xbox Series X/S released in August 2024."},
    { title: "Heavy Rain", publisher: "Sony Computer Entertainment", year: 2010,
        description: "Heavy Rain is a 2010 action-adventure video game developed by Quantic Dream and published by Sony Computer Entertainment. The game features four protagonists involved with the mystery of the Origami Killer, a serial killer who uses extended periods of rainfall to drown his victims. The player interacts with the game by performing actions highlighted on screen related to motions on the controller, and in some cases, performing a series of quick time events. The player's choices and actions during the game affect the narrative."},
    { title: "Monster Train", publisher: "Good Shepherd Entertainment", year: 2020,
        description: "Monster Train is a roguelike deck-building game developed by American studio Shiny Shoe and published by Good Shepherd Entertainment. It was initially released on May 21, 2020, for Windows, followed by releases on Xbox One on December 17, 2020, iOS on October 27, 2022, and PlayStation 5 on July 25, 2024. A Complete Edition of the game titled Monster Train First Class was released for Nintendo Switch on August 19, 2021. The game received positive reviews, being nominated in the category of Best Strategy/Tactics Game at IGN Best of 2020, as well as Strategy/Simulation Game of the Year at the 24th Annual D.I.C.E. Awards."},
    { title: "Slay the Spire", publisher: "Mega Crit", year: 2019,
        description: "Slay the Spire is a 2019 roguelike deck-building game developed by the American indie studio Mega Crit. It was published by Mega Crit for its initial PC release and by Humble Bundle for home consoles and mobile platforms. The game was released in early access for Microsoft Windows, macOS, and Linux in late 2017, with an official release in January 2019. It was released for PlayStation 4 in May 2019, for Nintendo Switch in June 2019 and for Xbox One in August 2019. An iOS version was released in June 2020, with an Android version released in February 2021."},
    { title: "Monster Hunter World", publisher: "Capcom", year: 2018,
        description: "Monster Hunter: World is a 2018 action role-playing game developed and published by Capcom. The fifth mainline installment in the Monster Hunter series, it was released worldwide for PlayStation 4 and Xbox One in January 2018, with a Windows version following in August 2018. In the game, the player takes the role of a Hunter, tasked to hunt down and either kill or trap monsters that roam in one of several environmental spaces. If successful, the player is rewarded through loot consisting of parts from the monster and other elements that are used to craft weapons and armor, amongst other equipment. The game's core loop has the player crafting appropriate gear to be able to hunt down more difficult monsters, which in turn provide parts that lead to more powerful gear. Players may hunt alone or in a group of up to four players via the game's online multiplayer."},
    { title: "Monster Hunter Rise", publisher: "Capcom", year: 2021,
        description: "Monster Hunter Rise is a 2021 action role-playing game developed and published by Capcom for the Nintendo Switch. It was released worldwide in March 2021, with a Windows port released in January 2022 and ports for PlayStation 4, PlayStation 5, Xbox One, and Xbox Series X/S were released in January 2023. An expansion pack, Sunbreak, was released in June 2022"}
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
    
    for(let i = 0; i < gameInfo.length; i++) {
        const info = gameInfo[i]
        const randomInt = Math.floor( Math.random() * storeCount + 1);
        const randomStores = await Storefront.aggregate([{ $sample: { size: randomInt}}])
        const dealInfoList = generateRandomDealData(randomStores);
        const newGame = new VideoGame({title: info.title, publisher: info.publisher, year: info.year, description: info.description});
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

