const {Schema, model} = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2');

const AddressSchema = Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref:'User',
        require:true
    },
    direccion:{
        type:String,
        require:true
    },
    numero:{
        type:String,
        require:true
    },
    phone:{
        type:String,
        require:true
    },
    codigoPostal:{
        type:Number,
    },
    region:{
        type:String,
        require:true
    },
    cuidad:{
        type:String,
        require:true
    },
    comuna:{
        type:String,
        require:true
    }    


})

AddressSchema.plugin(mongoosePaginate);

module.exports = model("Address", AddressSchema, "address")