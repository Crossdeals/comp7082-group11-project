const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Model representing the user's wishlist on Crossdeals
const WishlistModelSchema = new Schema({
    preferredStores: { type: [String], ref: 'Storefront'}, // list of store id references from Storefront representing user preferred stores
    games: { type: [Schema.Types.ObjectId], ref: 'VideoGame' } // list of video game id references from the Videogame collection that the user wants deal info for
});

const Wishlist = mongoose.model('Wishlist', WishlistModelSchema);

module.exports = Wishlist;