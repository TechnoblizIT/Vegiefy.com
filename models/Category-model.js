const mongoose = require('mongoose');

const categorySchema=mongoose.Schema({
    name:String,
    description:{
        type:String,
        default:""
    },
    product:[{
        type: mongoose.Schema.Types.ObjectId, ref: 'Products'
    }], 
})

module.exports=mongoose.model("Category",categorySchema)