const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const BestSellingSchema = Schema({
    nombreproducto:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        min: 0,
    },
    lastUpdatedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },

}) 

BestSellingSchema.plugin(mongoosePaginate)

module.exports = model("BestSelling",BestSellingSchema, 'bestsellings')