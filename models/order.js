const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const OrderSchema = Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    
    },
    products: [
        {
            product: { 
                type: Schema.Types.ObjectId, 
                ref: 'Product', 
                required: true 
            },
            priceunitary: { 
                type: Number,
                required: true 
            },
            quantity: { 
                type: Number, 
                required: true 
            },
            size: { 
                type: String,           
            }
        }
    ],
    orderNumber:{
        type:String,
        
    },
    status: { 
        type: String, 
        enum: ['pending', 'shipped', 'delivered', 'canceled'], 
        default: 'pending' 
    },
    shippingAddress: { 
        type: Schema.Types.ObjectId, 
        ref: 'Address', 
        required: true 
    },
    totalPrice: { 
        type: Number, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

OrderSchema.plugin(mongoosePaginate);

module.exports = model("Order", OrderSchema, "orders");
