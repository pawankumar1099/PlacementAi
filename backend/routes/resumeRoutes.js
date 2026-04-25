const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { PDFParse } = require('pdf-parse');
const Resume = require("../models/Resume.js");
const authMiddleware = require("../middleware/authMiddleware.js");

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });


router.post("/upload",authMiddleware, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Please upload a file with field name 'resume'" });
    }
    const filePath = req.file.path;
    console.log(filePath);

    const dataBuffer = fs.readFileSync(filePath);
    console.log(dataBuffer);


    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    const text = result.text ? result.text.toLowerCase() : "";
    await parser.destroy();


    
    const keywords = [
      { word: "javascript", weight: 8 },
      { word: "python", weight: 8 },
      { word: "java", weight: 8 },
      { word: "c++", weight: 8 },
      { word: "react", weight: 7 },
      { word: "node", weight: 7 },
      { word: "express", weight: 6 },
      { word: "django", weight: 6 },
      { word: "spring", weight: 6 },
      { word: "sql", weight: 6 },
      { word: "mongodb", weight: 6 },
      { word: "aws", weight: 5 },
      { word: "azure", weight: 5 },
      { word: "docker", weight: 5 },
      { word: "kubernetes", weight: 5 },
      { word: "git", weight: 5 },
      { word: "project", weight: 4 },
      { word: "team", weight: 4 },
      { word: "agile", weight: 4 },
      { word: "scrum", weight: 4 },
      { word: "bachelor", weight: 3 },
      { word: "master", weight: 3 },
      { word: "engineer", weight: 3 },
      { word: "developer", weight: 3 },
      { word: "experience", weight: 3 },
      { word: "education", weight: 3 },
      { word: "skills", weight: 3 },
      { word: "internship", weight: 2 },
      { word: "leadership", weight: 2 },
      { word: "communication", weight: 2 }
    ];

   
    const sections = [
      { name: "education", label: "Education section" },
      { name: "experience", label: "Experience section" },
      { name: "skills", label: "Skills section" },
      { name: "projects", label: "Projects section" }
    ];

    let score = 0;
    let feedback = [];

   
    function escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    keywords.forEach(({ word, weight }) => {
      const safeWord = escapeRegex(word);
      const regex = new RegExp(`\\b${safeWord}\\b`, "g");
      const matches = text.match(regex);
      if (matches) {
        const count = Math.min(matches.length, 3); 
        score += count * weight;
        feedback.push(`Keyword '${word}' found ${count} time(s)`);
      }
    });

    
    sections.forEach(({ name, label }) => {
      if (text.includes(name)) {
        score += 10;
        feedback.push(`${label} found`);
      } else {
        feedback.push(`${label} missing`);
      }
    });

    
    if (text.length > 1500) {
      score += 10;
      feedback.push("Good resume length");
    } else {
      feedback.push("Resume may be too short");
    }

   
    if (score > 100) score = 100;

    const resume = new Resume({
      userId: req.userId, 
      filePath,
      score,
      feedback: feedback.join("; ")
    });

    await resume.save();

    res.json(resume);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/my",authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });

    res.json(resumes);
  } catch (err) {
    res.status(500).json(err);
  }
});



router.get("/all",authMiddleware, async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;