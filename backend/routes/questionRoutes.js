const express = require('express');
const authMiddleware = require('../middleware/authMiddleware.js');
const Question = require("../models/Question.js");
const router = express.Router();

// List companies with available questions
router.get("/companies/list", authMiddleware, async (req, res) => {
  try {
    const companies = await Question.distinct("company");
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get 5 random MCQ questions for a company
router.get("/:company", authMiddleware, async (req, res) => {
  try {
    const company = req.params.company;

    const questions = await Question.aggregate([
      { $match: { company } },
      { $sample: { size: 5 } }
    ]);

    res.json(questions);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
