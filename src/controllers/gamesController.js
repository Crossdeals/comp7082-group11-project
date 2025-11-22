const express = require('express');
const router = express.Router();
const Storefront = require('../models/StorefrontModel');
const VideoGame = require('../models/VideoGameModel');

router.get("", async (req, res) => {
    const games = await VideoGame.find({}).populate({
        path: "deals",
        populate: {
            path: "storefront"
        }
    });
    res.status(200);
    res.json(games);
});

module.exports = router;