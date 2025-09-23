const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserModelSchema = new Schema({
    userName: { type: String },
    hashedPW: { type: String }
});

const User = mongoose.model('User', UserModelSchema);

module.exports = User;