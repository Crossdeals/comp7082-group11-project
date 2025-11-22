const express = require('express');
const jwt = require('../util/jwtHandler');
const router = express.Router();
const User = require('../models/UserModel');
const Storefront = require('../models/StorefrontModel');
const Wishlist = require('../models/WishlistModel');
const VideoGame = require('../models/VideoGameModel');
const mongoose = require("mongoose");

router.use(jwt.authenticateUser);

router.get("/index", async (req, res) => {
    const userData = await User.findByUserName(req.username).populate({
        path: 'wishlist',
        populate: {
            path: 'games', 
            populate: {
                path: 'deals', populate: {
                    path: 'storefront'
                }
            }
        }
    });
    res.status(200);
    res.json(userData.wishlist.games);
});

router.delete("/remove/:id", async (req, res) => {
    const gameId = req.params.id;
    const validId = mongoose.Types.ObjectId.isValid(gameId);
    if(!validId) {
        res.status(404);
        res.json({ message: "Paramter is not an id" });
        return;
    }

    const user = await User.findByUserName(req.username);
    const wishlist = await Wishlist.findById(user.wishlist);
    
    if(!wishlist.games.includes(gameId)) {
        res.status(404).json({ message: "Game not found" });
        return;
    }
    wishlist.games.pull(gameId);
    wishlist.markModified('games');
    try {
        await wishlist.save();
        res.status(200).json({ message: "Game removed" });
    } catch(error) {
        console.error("error in saving", error);
        res.status(500).send("error");
    }
});

router.post("/add", async (req,res) => {
    const title = req.body.title;
    const user = await User.findByUserName(req.username);
    const wishlist = await Wishlist.findById(user.wishlist);

    let game = await VideoGame.findByTitle(title);
    if(game) {
        if(wishlist.games.includes(game._id)) {
            res.status(400).json({ message: "Game already in wishlist" });
            return;
        }
    }
    else {
        // invoke web scraper here
        game = await VideoGame.createGameFromTitle(title);
        if(!game) {
            res.status(500).json({ message: "Error creating game" });
            return;
        }
    }
    
    wishlist.games.push(game);
    wishlist.markModified('games');
    try {
        await wishlist.save();
        res.status(200).json({ message: "Game added" });
    } catch(error) {
        console.error("error in saving", error);
        res.status(500).json({ message: "Error saving changes" });
    }
});

// frontend should send storefronts as array of object ids
router.patch("/storefront", async (req, res) => {
    const preferredStoresChanges = req.body.stores;
    const user = await User.findByUserName(req.username);
    const wishlist = await Wishlist.findById(user.wishlist);
    const newStores = [];

    for(let i = 0; i < preferredStoresChanges.length; i++) {
        const inStorefront = await Storefront.findById(preferredStoresChanges[i]);
        if(inStorefront) {
            newStores.push(preferredStoresChanges[i]);
        }
    }

    if(newStores.length === 0 && preferredStoresChanges.length > 0) {
        res.status(404).json({ message: "No valid stores to update" });
        return;
    }
    
    else if(newStores.length === wishlist.preferredStores.length) {
        const idStringArray = wishlist.preferredStores.map( id => id.toString());
        if(idStringArray.every(id => newStores.includes(id))){
            res.status(200).json({ message: "No changes to preferred stores" });
            return;
        }
    }

    wishlist.preferredStores = newStores;
    wishlist.markModified('preferredStores');
    try {
        await wishlist.save();
        res.status(200).json({ message: "Preferred stores updated" });
    } catch(error) {
        console.error("error in saving", error);
        res.status(500).json({ message: "Error saving changes" });
    }
});

module.exports = router;