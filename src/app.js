const express = require('express');
const app = express();
const connectDB = require('./config/db');
const accountRoute = require('./routes/accountRoutes');
const bodyParser = require('body-parser');

require('dotenv').config();
app.use(express.json());
app.use(bodyParser.json());

connectDB();

app.use("/", accountRoute);

module.exports = app;