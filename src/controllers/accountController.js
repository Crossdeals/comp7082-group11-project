const express = require('express');
const router = express.Router();
const passport = require("passport");
const User = require('../models/UserModel');
const bcrypt = require("bcrypt");
const jwtHandler = require('../util/jwtHandler');

// User registration route
router.post("/signup", async (req, res) => {
    console.log(req.body);
    const { username, password } = req.body;
    if (!username && !password) {
        return res
            .status(403)
            .send("register all fields required");
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

        // Login the user
        const token = jwtHandler.getToken(username)
        res.cookie('token', token, {
          httpOnly: true,
          maxAge: 2.16e7
        })
        res.status(200);
        res.send("User created");
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

/*
router.post('/login', passport.authenticate('local', {
  successRedirect: '/soon',
  failureRedirect: '/login',
}));
*/

// TODO: Remove the body error message for security
router.post('/login', async (req, res) => {
  const username = req.body.username;
  const existingUser = await User.findOne({ userName: username });

  if (existingUser) {
    const passwordEncrypted = existingUser.password;
    bcrypt.compare(req.body.password, passwordEncrypted, (err, success) => {
      if (err) {
        res.status(500);
        res.send("Password comparison error");
      }
      if (success) {
        const token = jwtHandler.getToken(existingUser.userName);
        res.cookie('token', token, {
          httpOnly: true,
          maxAge: 2.16e7
        })
        res.status(200);
        res.send({ message: "Login ok" });
      }
      else {
        res.status(403);
        res.send("Password does not match");
      }
    });
  }
  else {
    res.status(403);
    res.send("User does not exist");
  }
});

router.post('/username', function (req, res, next) {
  const username = req.body.username;
  let token = req.headers.cookie;
  token = token.split('=')[1];
  const verified = jwtHandler.verifyToken(username, token);
  let usernameVerified = verified.username;

  if (verified) {
    res.status(200);
    res.send({ username: usernameVerified });
  }
  else {
    res.status(403);
    res.send("Token verification failed");
  }
});

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;