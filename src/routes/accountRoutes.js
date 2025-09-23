const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../models/UserModel');

const jsonParser = bodyParser.json();

router.get("/", (req, res) => {
    res.send("Crossdeals account creation/login screen");
});

router.get("/test", async (req,res)=>{
    try {
        const results = await User.find();
        console.log(results);
    } catch(err) {}

    res.send("done");
});

router.post("/", jsonParser, async (req, res) => {
    console.log("got post request ", req.body);
    res.send("got post request");
    const data  = req.body;
    console.log(data);
    const newUser = new User(req.body);
    try {
        var test = await newUser.save();
    } catch(err){
        console.log("error saving ", err);
    }
});

module.exports = router;