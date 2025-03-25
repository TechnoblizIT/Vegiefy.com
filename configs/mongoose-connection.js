const mongoose = require('mongoose');

const dbconnect = mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 30000,  // 30 seconds for initial connection
  socketTimeoutMS: 30000    // 30 seconds for socket activity
}).then(function(connection) {
    console.log('Connected to Database');
}).catch(function(err) {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit(1);  // Exit if the connection fails
});

module.exports = dbconnect;