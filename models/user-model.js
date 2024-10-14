const mongoose = require('mongoose')

const userSchema=mongoose.Schema({
    name:String,
    email:String,
    password:String,
    mobile:String,
    address:String,
    cart:[{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
         quantity: { type: Number, default: 1 }
    }],
    orders:{
        typeof:Array,
        default:[]
    },
})

module.exports=mongoose.model("User",userSchema)