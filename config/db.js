const mongoose = require('mongoose');
require('dotenv').config();
const Book = require('../models/book.model');
const Loan = require('../models/loan.model');
const Member = require('../models/member.model');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error("MongoDB connection failed: ", error);
        process.exit(1);
    }
};
const dbContext = {
    connectDB,
    Book,
    Loan,
    Member
}

module.exports = dbContext;