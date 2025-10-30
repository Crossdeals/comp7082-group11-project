const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const UserModelSchema = new Schema({
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    wishlist: { type: Schema.Types.ObjectId, ref: 'Wishlist' }
});

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

UserModelSchema.methods.comparePassword = async function(password, callback) {
    try {
        return await bcrypt.compare(password, this.password, callback);
    } catch(error) {
        throw error;
    }
}

const User = mongoose.model('User', UserModelSchema);

module.exports = User;