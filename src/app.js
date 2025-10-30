const express = require('express');
const app = express();
const connectDB = require('./config/db');
const accountController = require('./controllers/accountController');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const StorefrontSeeder = require('./util/storefrontSeeder');

require('dotenv').config();
connectDB();
StorefrontSeeder();
app.use(cookieParser());

const allowHeaders = (req, res, next) => {
    // If hosted, set the origin to the FE address.
    res.header('Access-Control-Allow-Origin', `null`);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
}

app.use(allowHeaders);

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", accountController);

module.exports = app;