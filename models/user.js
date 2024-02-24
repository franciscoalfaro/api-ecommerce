const {Schema, model} = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2');

const UserSchema = Schema({
    name:{
        type:String,
        require:true
    },
    surname:{
        type:String
    },
    nick:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    role:{
        type:String,
        default:"role_user"
    },
    image:{
        type:String,
        default:"default.png"
    },
    eliminado:{
        type: Boolean,
        default: false
    },
    create_at:{
        type:Date,
        default:Date.now

    }

})


UserSchema.plugin(mongoosePaginate);


module.exports = model("User", UserSchema, "users")