const express = require('express');
const jwt = require('../util/jwtHandler');
const router = express.Router();
const User = require('../models/UserModel');
const Wishlist = require('../models/WishlistModel');
const VideoGame = require('../models/VideoGameModel');

//router.use(jwt.authenticateUser);

router.get("/index", async (req, res) => {
    const userData = await User.findByUserName(req.body.username).populate({
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
    const user = await User.findByUserName(username);
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

router.post("/add", async (req,res) => {
    console.log("adding " + req.body.title);
    const title = req.body.title;
    const username = req.body.username;
    const user = await User.findByUserName(username);
    const wishlist = await Wishlist.findById(user.wishlist);

    let game = await VideoGame.findByTitle(title);
    if(game) {
        if(wishlist.games.includes(game._id)) {
            res.status(400).send("game already in wishlist");
            return;
        }
    }
    game = await VideoGame.createGameFromTitle(title);
    wishlist.games.push(game);
    wishlist.markModified('games');
    const test = await wishlist.save();
    res.status(200).send("game added");

    
});

module.exports = router;