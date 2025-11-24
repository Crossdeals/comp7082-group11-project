const express = require('express');
const router = express.Router();
const VideoGame = require('../models/VideoGameModel');
const mongoose = require("mongoose");
const jwt = require('../util/jwtHandler');
const User = require('../models/UserModel');
const Wishlist = require('../models/WishlistModel');

router.use(jwt.checkForToken);

const isWishlisted = async function(username,gameList) {
    if(!username) {
        return;
    }
    
    const user = await User.findByUserName(username);
    const userList = await Wishlist.findById(user.wishlist);
    for(let i = 0; i < gameList.length; i++) {
        gameList[i].isWishlisted = false;
        if(userList.games.includes(gameList[i]._id)) {
            gameList[i].isWishlisted = true;
        }
    }
}

router.get("", async (req, res) => {
    const games = await VideoGame.find({}).limit(10).populate("deals.storefront").lean();

    await isWishlisted(req.username, games);
    
    res.status(200);
    res.json(games);
});

router.get("/search", async (req, res) => {
    const gameTitle = req.query.title;
    const games = await VideoGame.find({ title: { $regex: gameTitle, $options: "i" }})
        .populate("deals.storefront").lean();
    if(games.length === 0) {
        res.status(404);
        res.json({ message: "No games found" });
        return;
    }

    await isWishlisted(req.username, games);
    
    res.status(200);
    res.json(games);
});

router.get("/featured", async (req, res) => {
    let games;
    try {
        games = await VideoGame.aggregate([{ $sample: { size: 1 }}]);
    } catch(err) {
        res.status(500);
        res.json({ message: "Server error" });
    }

    if(games.length === 0) {
        res.status(404);
        res.json({ message: "No featured game found" });
        return;
    }

    await VideoGame.populate(games, { path: "deals.storefront"});

    await isWishlisted(req.username, games);
    
    res.status(200);
    res.json(games[0]);
});

router.get("/:id", async (req, res) => {
    const gameId = req.params.id;
    const validId = mongoose.Types.ObjectId.isValid(gameId);
    if(!validId) {
        res.status(404);
        res.json({ message: "Paramter is not an id" });
        return;
    }
    const game = await VideoGame.findById(gameId).populate("deals.storefront").lean();
    if(!game) {
        res.status(404);
        res.json({ message: "Invalid game id" });
        return;
    }
    const list = [game];
    
    await isWishlisted(req.username, list);
    
    res.status(200);
    res.json(list[0]);
});

module.exports = router;