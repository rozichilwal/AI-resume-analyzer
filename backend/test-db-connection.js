require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB Atlas connection...');
console.log('Connection string:', process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@'));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('SUCCESS! MongoDB Atlas connected successfully');
        console.log('Connected to:', mongoose.connection.host);
        process.exit(0);
    })
    .catch((error) => {
        console.log('FAILED! MongoDB connection error:');
        console.log('Error message:', error.message);
        console.log('Error code:', error.code);
        process.exit(1);
    });
