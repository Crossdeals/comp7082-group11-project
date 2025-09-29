const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../models/UserModel');

const jsonParser = bodyParser.json();

router.get("/", (req, res) => {
    res.send("Crossdeals account creation/login screen");
});

module.exports = router;