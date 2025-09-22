const express = require('express');
const app = express();

require('dotenv').config();

app.get('/', (req, res) => {
  res.send('Cross Deals!');
});

module.exports = app;