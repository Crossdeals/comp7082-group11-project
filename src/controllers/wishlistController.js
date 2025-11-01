const express = require('express');
const jwt = require('../util/jwtHandler');
const router = express.Router();
const User = require('../models/UserModel');
const Wishlist = require('../models/WishlistModel');

//router.use(jwt.authenticateUser);

router.get("/index", async (req, res) => {
    const userData = await User.findOne({ userName: req.body.username }).populate({
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
    const username = req.body.username;
    const user = await User.findOne({ userName: username });
    const wishlist = await Wishlist.findById(user.wishlist);
    if(!wishlist.games.includes(gameId)) {
        res.status(404).send("Game not found");
        return;
    }
    console.log("removing id " + req.params.id);
    wishlist.games.pull(gameId);
    wishlist.markModified('games');
    const test = await wishlist.save();
    if(!wishlist.games.includes(gameId)) {
        res.status(200).send("game removed");
    }
    else{
        res.status(404).send("error");
    }
});

module.exports = router;