const mongoose = require('mongoose');

const dbconnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to Database');
    } catch (err) {
        console.error('❌ Could not connect to the database. Exiting now...', err);
        process.exit(1); // Exit the process if the connection fails
    }
};

dbconnect();

module.exports = dbconnect;
