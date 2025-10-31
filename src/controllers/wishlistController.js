const express = require('express');
const router = express.Router();
const Wishlist = require('../models/WishlistModel');


router.get("/index", async (req, res) => {

    const listId = req.cookies.wishlist;
    res.clearCookie('wishlist');
    const gameList = await Wishlist.findById(listId).populate({
        path: 'games', 
        populate: {
            path: 'deals', populate: {
                path: 'storefront'
            }
        }
    });
    res.status(200);
    res.json(gameList.games);
});

module.exports = router;