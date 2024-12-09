const mongoose = require('mongoose')

const productSchema=mongoose.Schema({
name:String,
price:Number,
description:String,
image:{
    Buffer:Buffer,
    imageType:String,
},
instock:Number,
category:String,
expirydate:Date,
})

module.exports=mongoose.model("Products",productSchema)