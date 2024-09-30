const mongoose = require('mongoose')
require('dotenv').config()
const dbconnect= mongoose.connect("mongodb+srv://sakshiambule1:sakshi1006@cluster0.k6jxt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(function(connection) {
    console.log('Connected to MongoDB')
}).catch(function(err){
    console.log('Could not connect to the database. Exiting now...')
    
})

module.exports = dbconnect;

