const mongoose = require('mongoose')

const connectDb = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI environment variable is not set");
        }
        await mongoose.connect(uri);
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        throw err;
    }
}

module.exports = connectDb;
