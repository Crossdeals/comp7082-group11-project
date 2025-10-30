const mongoose = require("mongoose");
const Storefront = require('./StorefrontModel');
const VideoGame = require('./VideoGameModel');

const Schema = mongoose.Schema;

const WishlistModelSchema = new Schema({
    preferredStores: { type: [Schema.Types.ObjectId], ref: 'Storefront'},
    games: { type: [Schema.Types.ObjectId], ref: 'VideoGame' }
});

const Wishlist = mongoose.model('Wishlist', WishlistModelSchema);

module.exports = Wishlist;