const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const DealInfoModelSchema = new Schema({
    storefront: { type: Schema.Types.ObjectId, ref: 'Storefront', required: true },
    originalPrice: { type: Schema.Types.Double, required: true },
    currentPrice: { type: Schema.Types.Double, required: true },
    bestPrice: { type: Schema.Types.Double },
    dealEndDate: { type: Date }
});

const VideoGameModelSchema = new Schema({
    title: { type: String, required: true, unique: true },
    deals: { type: [DealInfoModelSchema] }
});

VideoGameModelSchema.statics.findByTitle = function(title) {
    return this.findOne({ title: title });
};

VideoGameModelSchema.statics.createGameFromTitle = async function(title) {
    try {
        const newGame = await this.create( { title: title} );
        return newGame;
    } catch(error) {
        throw error;
    }
}

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