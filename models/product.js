const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const ProductSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    brand: { 
        type: String, 
        required: true 
    },
    size: { 
        type: String, 
        required: true 
    },
    price: { 
        type: String,
        required: true 
    },
    Autor:{
        type: String,
        required: true
    },
    category: { 
        type: Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true 
    },
    stock: {
        type: Schema.Types.ObjectId,
        ref: 'Stock',
        required: true
    },
    images: [{   
        filename: String,
    }]
});

ProductSchema.plugin(mongoosePaginate);

module.exports = model('Product', ProductSchema, "products");
