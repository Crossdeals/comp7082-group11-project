const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

//Model representing a user of Crossdeals
const UserModelSchema = new Schema({
    userName: { type: String, required: true, unique: true }, // username supplied by the user during signup
    password: { type: String, required: true }, // password supplied by the user during signup, which is stored after encryption
    wishlist: { type: Schema.Types.ObjectId, ref: 'Wishlist' } // id reference of the user's wishlist stored in the Wishlist collection
});

// encrypts the user's password on save if modified
UserModelSchema.pre('save', async function(next) {
    try {
        if(!this.isModified('password')) {
            return next();
        }
        const salt = await bcrypt.genSalt(15);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch(error) {
        next(error);
    }
});

// Compare a plain text password with the stored hashed password
UserModelSchema.methods.comparePassword = async function(password, callback) {
    try {
        return await bcrypt.compare(password, this.password, callback);
    } catch(error) {
        throw error;
    }
}

// Find a user by username
UserModelSchema.statics.findByUserName = function(userName) {
    return this.findOne({ userName: userName });
};

const User = mongoose.model('User', UserModelSchema);

module.exports = User;