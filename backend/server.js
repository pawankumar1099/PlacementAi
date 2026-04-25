const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDb = require('./config/db.js')
const cookieParser = require("cookie-parser");
require('dotenv').config() 

const app = express();


const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5000", "https://placementai-2.onrender.com"],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", require("./routes/authRoutes.js"));
app.use("/api/resume", require("./routes/resumeRoutes.js"));
app.use("/api/questions", require("./routes/questionRoutes.js"));
app.use("/api/code", require("./routes/CodeRoutes.js"));

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// SPA fallback route - serve index.html for all non-API routes
app.use((req, res, next) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  } else {
    next();
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";

const startServer = async () => {
  try {
    await connectDb();
    const server = app.listen(PORT, HOST, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
    });
    
    server.on('error', (err) => {
      console.error('Server error:', err);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
