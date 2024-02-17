const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const StockSchema = Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
    lastUpdatedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },

});

StockSchema.plugin(mongoosePaginate);

module.exports = model("Stock", StockSchema, "stocks");
