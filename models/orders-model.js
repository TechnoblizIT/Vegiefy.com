const mongoose = require('mongoose');

const orderSchema=mongoose.Schema({
    Name :String,
    Date:Date,
    Address:String,
    Products:[{
        type: mongoose.Schema.Types.ObjectId, ref: 'Products'
    }],
    TotalPrice:Number,
    Phone:Number
})

module.exports=mongoose.model("Orders",orderSchema)

