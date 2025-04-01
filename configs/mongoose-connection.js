const mongoose = require('mongoose');

const dbconnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            connectTimeoutMS: 30000, // 30 seconds for initial connection
            socketTimeoutMS: 30000   // 30 seconds for socket activity
        });
        console.log('✅ Connected to Database');
    } catch (err) {
        console.error('❌ Could not connect to the database. Exiting now...', err);
        process.exit(1); // Exit the process if the connection fails
    }
};

dbconnect();

module.exports = dbconnect;
