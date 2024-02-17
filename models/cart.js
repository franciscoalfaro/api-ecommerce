const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const CartSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    items: [
        {
            product: {
                type: Schema.Types.ObjectId, 
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ]
});

CartSchema.plugin(mongoosePaginate);

module.exports = model('Cart', CartSchema, "carts");
