const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const StorefrontModelSchema = new Schema({
    url: { type: String, required: true },
    name: { type: String, required: true },
    platforms: {
        type: [String],
        required: true,
        validate: function(v) {
            return v && v.length > 0;
        }, message: "Platforms list can't be empty"}
});

const Storefront = mongoose.model('Storefront', StorefrontModelSchema);

module.exports = Storefront;