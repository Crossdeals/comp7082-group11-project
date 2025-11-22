const express = require('express');
const router = express.Router();
const Storefront = require('../models/StorefrontModel');
const VideoGame = require('../models/VideoGameModel');

router.get("", async (req, res) => {
    const games = await VideoGame.find({}).populate("deals.storefront");
    res.status(200);
    res.json(games);
});

router.get("/:id", async (req, res) => {
    const gameId = req.params.id;
    const game = await VideoGame.findById(gameId).populate("deals.storefront");
    if(!game) {
        res.status(404);
        res.json({ message: "Invalid game id" });
        return;
    }
    res.status(200);
    res.json(game);
});

module.exports = router;