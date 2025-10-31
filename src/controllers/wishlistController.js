const express = require('express');
const jwt = require('../util/jwtHandler');
const router = express.Router();
const User = require('../models/UserModel');
const Wishlist = require('../models/WishlistModel');

//router.use(jwt.authenticateUser);

router.get("/index", async (req, res) => {
    const userData = await User.findOne({ userName: req.body.user }).populate({
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

module.exports = router;