const mongoose = require('mongoose');
const querySchema = mongoose.Schema({
    name:String,
    email:String,
    subject:String,
    message:String,
    date:Date
})

module.exports = mongoose.model('Query', querySchema)