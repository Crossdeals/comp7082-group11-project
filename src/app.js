const express = require('express');
const app = express();
const accountController = require('./controllers/accountController');
const wishlistController = require('./controllers/wishlistController');
const gamesController = require('./controllers/gamesController');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const cors = require('cors');

require('dotenv').config();

// Setup file for the Crossdeals backend

app.use(cookieParser());

const corsOptions = {
    origin: 'null',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}

app.use(cors(corsOptions));

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", accountController);
app.use("/wishlist", wishlistController);
app.use("/games", gamesController);

module.exports = app;