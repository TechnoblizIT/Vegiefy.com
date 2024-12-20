const mongoose = require('mongoose')

const productSchema=mongoose.Schema({
name:String,
price:Number,
description:String,
description2:String,
image:{
    file:Buffer,
    imageType:String,
},
unitsold:{
    type:Number,
    default:0,
},
instock:Number,
category:String,
expirydate:Date,
isActive:Boolean,
})

module.exports=mongoose.model("Products",productSchema)