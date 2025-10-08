const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../models/UserModel');
const path = require('path');

const jsonParser = bodyParser.json();
const frontendPath = path.join(__dirname, '..', '..', 'crossdeals-frontend','html');

router.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath,'login.html'));
});

router.get("/login", (req, res) => {
    res.sendFile(path.join(frontendPath,'login.html'));
});

router.get("/signup", (req, res) => {
    res.sendFile(path.join(frontendPath,'signup.html'));
});

router.get("/soon", (req,res)=>{
    res.sendFile(path.join(frontendPath, '..', 'index.html'));
});

module.exports = router;