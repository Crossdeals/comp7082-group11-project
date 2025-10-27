const express = require('express');
const router = express.Router();
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
            .json({ message: "Missing username or password"});
    }
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ userName: username });
        if (existingUser) {
            return res
                .status(409)
                .json({ message: "User already exists" });
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
        res.json({ message: "User created" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// TODO: Remove the body error message for security
router.post('/login', async (req, res) => {
  const username = req.body.username;
  const existingUser = await User.findOne({ userName: username });

  if (existingUser) {
    const passwordEncrypted = existingUser.password;
    bcrypt.compare(req.body.password, passwordEncrypted, (err, success) => {
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

router.post('/username', function (req, res, next) {
  const username = req.body.username;
  let token = req.headers.cookie;
  token = token.split('=')[1];
  const verified = jwtHandler.verifyToken(username, token);
  let usernameVerified = verified.username;

  if (verified) {
    res.status(200);
    res.json({ username: usernameVerified });
  }
  else {
    res.status(403);
    res.json({ message: "Token verification failed" });
  }
});

router.get('/logout', function(req, res, next) {
  res.cookie('token', '', {
    httpOnly: true,
    maxAge: 0
  })
  res.status(200);
  res.json({ message: "Log out successful" });
});

module.exports = router;