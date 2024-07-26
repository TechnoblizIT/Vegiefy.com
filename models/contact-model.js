const mongoose = require('mongoose')

const contactSchema=mongoose.Schema({
    name:String,
    email:String,
    subject:String,
    message:String
})

module.exports=mongoose.model("Contactus",contactSchema)