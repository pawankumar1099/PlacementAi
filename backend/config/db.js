const mongoose = require('mongoose')

const connectDb = () => {
    const uri = process.env.MONGO_URI || "mongodb+srv://pawankumar:TrrgyQ8WfaF8WuEl@pawan.7g16mtp.mongodb.net/placement-ai";
    mongoose.connect(uri)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("MongoDB connection error:", err.message));
}

module.exports = connectDb;
