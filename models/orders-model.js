const mongoose = require('mongoose');

const orderSchema=mongoose.Schema({
    orderid:String,
    Date:Date,
    User:{
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    Products:[{
        type: mongoose.Schema.Types.ObjectId, ref: 'Products'
    }],
    TotalPrice:Number,
    
    DeliveryBoy:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Deliveryboys'
    },
    status:{
        type:String,
        default:""
    }
})

module.exports=mongoose.model("Orders",orderSchema)

