const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Mongodb mongoose model to represent Storefronts. A custom _id is used instead of using the generated id to ensure the id remains consistent.
const StorefrontModelSchema = new Schema({
    _id: { type: String, required: true}, // id of the Storefront in the collection
    url: { type: String, required: true }, // url to the Storefront website
    name: { type: String, required: true }, // name of the Storefronts
    platforms: { // gaming platforms that the Storefront sells ie PS5
        type: [String],
        required: true,
        validate: function(v) {
            return v && v.length > 0;
        }, message: "Platforms list can't be empty"}
});

const Storefront = mongoose.model('Storefront', StorefrontModelSchema);

module.exports = Storefront;