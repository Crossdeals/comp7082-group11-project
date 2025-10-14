const express = require('express');
const app = express();
const connectDB = require('./config/db');
const accountRoute = require('./routes/accountRoutes');
const accountController = require('./controllers/accountController');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const localStrategy = require('./config/passport.js');
const cookieParser = require("cookie-parser");

require('dotenv').config();
connectDB();
app.use(
    session({
        secret: "Crossdeals",
        resave: false,
        saveUninitialized: false,
    })
);
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
app.use(passport.initialize());
app.use(passport.session());


app.use("/", accountRoute);
app.use("/", accountController);

app.use(express.static(path.join(__dirname, '..', 'crossdeals-frontend')));

module.exports = app;