const mongoose = require('mongoose')
require('dotenv').config()
const dbconnect= mongoose.connect(process.env.MONGODB_URI).then(function(connection) {
    console.log('Connected to MongoDB')
}).catch(function(err){
    console.log('Could not connect to the database. Exiting now...')
    
})

module.exports = dbconnect;

