const express = require('express');
const app = express();
const connectDB = require('./config/db');

require('dotenv').config();

connectDB();

app.get('/', (req, res) => {
  res.send('Cross Deals!');
});

module.exports = app;