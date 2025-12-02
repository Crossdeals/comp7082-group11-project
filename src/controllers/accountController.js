const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const jwtHandler = require('../util/jwtHandler');
const Wishlist = require('../models/WishlistModel');
const Storefront = require('../models/StorefrontModel');

// Controller for user signup and login

// Creates a new users wishlist and assigns the id to the user
async function createWishList(user){
    try {
        const storeIds = await Storefront.distinct('_id');
        const wishList = await Wishlist.create({ preferredStores: storeIds });
        user.wishlist = wishList._id;
    } catch(error) {
        throw error;
    }
}

// Sign up new and fail is user already exists or if data from fields are invalid
router.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res
            .status(403)
            .json({ message: "Missing username or password" });
    }
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ userName: username });
        if (existingUser) {
            return res
                .status(409)
                .json({ message: "User already exists" });
        }
        // Create and save the new user
        const newUser = new User({ userName: username, password: password });
        await createWishList(newUser);
        await newUser.save();

        // Login the user
        const token = jwtHandler.getToken(username)
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 2.16e7
        })
        res.status(200);
        res.json({ message: "User created" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Login an existing user and fail if user does not exist or data from fields is invalid
router.post('/login', async (req, res) => {
    const username = req.body.username;
    const existingUser = await User.findOne({ userName: username });

    if (existingUser) {
        existingUser.comparePassword(req.body.password, (err, success) => {
            if (err) {
                res.status(500);
                res.json({ message: "Password comparison error" });
            }
            if (success) {
                const token = jwtHandler.getToken(existingUser.userName);
                res.cookie('token', token, {
                    httpOnly: true,
                    maxAge: 2.16e7
                })
                res.status(200);
                res.json({ message: "Login ok" });
            }
            else {
                res.status(403);
                res.json({ message: "Password does not match" });
            }
        });
    }
    else {
        res.status(403);
        res.json({ message: "User does not exist" });
    }
});

// Verifies if user with username is a valid user
router.post('/username', function (req, res, next) {
    const username = req.body.username;
    let token = req.cookies.token; 
    const verifiedToken = jwtHandler.verifyToken(token);
    if(!verifiedToken) {
        res.status(401);
        res.json({ message: "Access Denied" });
        return;
    }
    const verified = verifiedToken.username === username;

    if (verified) {
        res.status(200);
        res.json({ username: verifiedToken.username });
    }
    else {
        res.status(403);
        res.json({ message: "Token verification failed" });
    }
});

// Logout current user
router.get('/logout', function (req, res, next) {
    res.cookie('token', '', {
        httpOnly: true,
        maxAge: 0
    })
    res.status(200);
    res.json({ message: "Log out successful" });
});

module.exports = router;