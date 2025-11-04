const express = require('express');
const app = express();
const connectDB = require('./config/db');
const accountController = require('./controllers/accountController');
const wishlistController = require('./controllers/wishlistController');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const StorefrontSeeder = require('./util/storefrontSeeder');
const cors = require('cors');

require('dotenv').config();
connectDB();
StorefrontSeeder();
app.use(cookieParser());

const corsOptions = {
    origin: 'null',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}

app.use(cors(corsOptions));

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", accountController);
app.use("/wishlist", wishlistController);

module.exports = app;