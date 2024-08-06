const mongoose = require('mongoose')

const userSchema=mongoose.Schema({
    name:String,
    email:String,
    password:String,
    mobile:String,
    address:String,
    cart:[{
         type: mongoose.Schema.Types.ObjectId, ref: 'Products'
    }],
    orders:{
        typeof:Array,
        default:[]
    },
})

module.exports=mongoose.model("User",userSchema)