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
const HOST = process.env.HOST || "127.0.0.1";

const server = app.listen(PORT, HOST, () => {
    const addr = server.address();
    const address = addr && typeof addr === 'object' ? addr.address : HOST;
    const port = addr && typeof addr === 'object' ? addr.port : PORT;
    console.log(`Server running on ${address}:${port}`)
    connectDb()
});

server.on('error', (err) => {
    console.error('Server error:', err);
});
