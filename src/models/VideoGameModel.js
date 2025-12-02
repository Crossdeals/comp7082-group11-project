const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Model representing deal information for a specific storefront
const DealInfoModelSchema = new Schema({
    storefront: { type: String, ref: 'Storefront', required: true }, // id reference to a Storefront entry
    originalPrice: { type: Schema.Types.Double, required: true }, // price before deal
    currentPrice: { type: Schema.Types.Double, required: true }, // current deal price
    bestPrice: { type: Schema.Types.Double }, // lowest price since being added to Crossdeals
    dealEndDate: { type: Date } // end date of the current deal
});

// Model representing video games that Crossdeals is keeping track of
const VideoGameModelSchema = new Schema({
    title: { type: String, required: true, unique: true }, // name of the video game
    publisher: {type: String }, // name of the publisher
    year: { type: Number }, // release year
    description: { type: String }, // short description of the video game
    deals: { type: [DealInfoModelSchema] } // array of deal info for the game
});

// Find a video game by title
VideoGameModelSchema.statics.findByTitle = function(title) {
    return this.findOne({ title: title });
};

// Creates a video game entry using a title
VideoGameModelSchema.statics.createGameFromTitle = async function(title) {
    try {
        const newGame = await this.create( { title: title} );
        return newGame;
    } catch(error) {
        throw error;
    }
}

// Add deal information to a video game
VideoGameModelSchema.methods.pushDealInfo = async function(dealInfo) {
    this.deals.push(dealInfo);
    try {
        await this.validate();
    }
    catch(error) {
        this.deals.pop();
        throw error;
    }
}

const VideoGame = mongoose.model('VideoGame', VideoGameModelSchema);

module.exports = VideoGame;