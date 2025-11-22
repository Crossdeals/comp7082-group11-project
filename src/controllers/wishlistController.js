const express = require('express');
const jwt = require('../util/jwtHandler');
const router = express.Router();
const User = require('../models/UserModel');
const Storefront = require('../models/StorefrontModel');
const Wishlist = require('../models/WishlistModel');
const VideoGame = require('../models/VideoGameModel');

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
            res.status(400).send("game already in wishlist");
            return;
        }
    }
    else {
        game = await VideoGame.createGameFromTitle(title);
        if(!game) {
            res.status(500).send("error creating game");
            return;
        }
    }
    
    wishlist.games.push(game);
    wishlist.markModified('games');
    try {
        await wishlist.save();
        res.status(200).send("game added");
    } catch(error) {
        console.error("error in saving", error);
        res.status(500).send("error");
    }
});

// frontend should send storefronts as array of object ids
router.patch("/storefront", async (req, res) => {
    const preferredStores = req.body.stores;
    const user = await User.findByUserName(req.username);
    const wishlist = await Wishlist.findById(user.wishlist);
    const newStores = [];

    for(let i = 0; i < preferredStores.length; i++) {
        const inStorefront = await Storefront.findById(preferredStores[i]);
        if(inStorefront) {
            newStores.push(preferredStores[i]);
        }
    }

    if(newStores.length === wishlist.preferredStores.length) {
        const idStringArray = wishlist.preferredStores.map( id => id.toString());
        if(idStringArray.every(id => newStores.includes(id))){
            res.status(200).send("no changes to preferred stores");
            return;
        }
    }

    wishlist.preferredStores = newStores;
    wishlist.markModified('preferredStores');
    try {
        await wishlist.save();
        res.status(200).send("preferred stores updated");
    } catch(error) {
        console.error("error in saving", error);
        res.status(500).send("error");
    }
});

module.exports = router;