const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDb = require('./config/db.js')
const cookieParser = require("cookie-parser");

const app = express();


const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", require("./routes/authRoutes.js"));
app.use("/api/resume", require("./routes/resumeRoutes.js"));
app.use("/api/questions", require("./routes/questionRoutes.js"));
app.use("/api/code", require("./routes/CodeRoutes.js"));

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`)
    connectDb()
});

server.on('error', (err) => {
    console.error('Server error:', err);
});
