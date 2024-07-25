const mongoose = require('mongoose')

const userSchema=mongoose.Schema({
    name:String,
    email:String,
    password:String,
    mobile:String,
    address:String,
    cart:{
        typeof:Array,
        default:[]
    },
    orders:{
        typeof:Array,
        default:[]
    },
})

module.exports=mongoose.model("User",userSchema)