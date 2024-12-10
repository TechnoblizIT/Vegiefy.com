const mongoose = require('mongoose')

const deliveryboySchema=mongoose.Schema({
    name:String,
    email:String,
    usernames:String,
    password:String,
    reenterpassword:String,
    mobile:String,
    orders:[{
        type: mongoose.Schema.Types.ObjectId, ref: 'Orders'
    }],
    joiningDate:Date,
    IDproof:String,
    IDupload:{
         file:Buffer,
         filetype:String,
    },
    profileimage:{
         file:Buffer,
         filetype:String,
    }

})

module.exports=mongoose.model("Deliveryboys",deliveryboySchema) 