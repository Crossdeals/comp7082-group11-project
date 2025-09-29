const express = require('express');
const app = express();
const connectDB = require('./config/db');
const accountRoute = require('./routes/accountRoutes');
const accountController = require('./controllers/accountController');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');

app.use(
    session({
        secret: "Crossdeals",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.authenticate('session'));
require('dotenv').config();
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

connectDB();

app.use("/", accountRoute);
app.use("/", accountController);

module.exports = app;