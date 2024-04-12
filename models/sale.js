const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const SaleSchema = Schema({
    products: [
        {
            product: { 
                type:String,
                required: true 
            },
            priceunitary: { 
                type: Number,
                required: true 
            },
            quantity: { 
                type: Number, 
                required: true,
                min: 0,
            }
        }
    ],

    ventaMensual:{
        type:Number,
        required:true,
        min: 0,
    },
    month:{
        type:Number,
        required:true
    },
    year:{
        type:Number,
        required:true
    },
    lastUpdatedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },

}) 

SaleSchema.plugin(mongoosePaginate)

module.exports = model("Sale",SaleSchema, 'sales')