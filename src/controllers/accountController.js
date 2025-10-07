const express = require('express');
const router = express.Router();
const passport = require("passport");
const User = require('../models/UserModel');
const bcrypt = require("bcrypt");

// User registration route
router.post("/signup", async (req, res) => {
    console.log(req.body);
    const { username, password, confirmpassword } = req.body;
    if (!username && !password && !confirmpassword) {
        return res
            .status(403)
            .send("register all fields required");
    }
    if (confirmpassword !== password) {
        return res
            .status(403)
            .send("register Password do not match");
    }
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ userName: username });
        if (existingUser) {
            return res
                .status(409)
                .send("register Username already exists");
        }

        // Hash the password before saving it to the database
        const salt = await bcrypt.genSalt(15);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and save the new user
        const newUser = new User({ userName: username, password: hashedPassword });
        await newUser.save();

        return res.redirect("/account-created");
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/soon',
  failureRedirect: '/login.html',
}));


router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;