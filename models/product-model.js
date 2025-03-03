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
category:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
},
expirydate:Date,

quantitySelector:{
    type: String,
    default: "Kg",
},

isActive:{
    type:Boolean,
    default:true,
},
})

module.exports=mongoose.model("Products",productSchema)