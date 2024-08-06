const mongoose = require('mongoose');


const adminSchema =mongoose.Schema({
    name:String,
    email:String,
    password:String,
    role:{
        type:String,
        default:"admin"
    }
})

module.exports=mongoose.model("Admin",adminSchema)