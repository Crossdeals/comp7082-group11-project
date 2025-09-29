const express = require('express');
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require('../models/UserModel');
const bcrypt = require("bcrypt");

// User registration route
router.post("/register", async (req, res) => {
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

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            // Find the user by username in the database
            const query = { userName: username};
            const user = await User.findOne(query);
            // If the user does not exist, return an error
            if (!user) {
                return done(null, false, { error: "Incorrect username" });
            }

            // Compare the provided password with the 
            // hashed password in the database
            
            const passwordsMatch = await bcrypt.compare(
                password,
                user.password
            );
            
            // If the passwords match, return the user object
            if (passwordsMatch) {
                return done(null, user);
            } else {
                // If the passwords don't match, return an error
                return done(null, false, { error: "Incorrect password" });
            }
        } catch (err) {
            return done(err);
        }
    })
);

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/login-success',
  failureRedirect: '/login-failure'
}));

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;