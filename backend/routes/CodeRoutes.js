const express = require("express");
const router = express.Router();
const axios = require("axios");
const authMiddleware = require("../middleware/authMiddleware.js");
const CodingQuestion = require("../models/CodingQuestion.js");

// List coding questions for a company (without revealing expectedOutput)
router.get("/list/:company",  async (req, res) => {
  try {
    const company = req.params.company;
    const questions = await CodingQuestion.find({ company }).select("title description input company");
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single coding question (without revealing expectedOutput)
router.get("/question/:id",  async (req, res) => {
  try {
    const q = await CodingQuestion.findById(req.params.id).select("title description input company");
    if (!q) return res.status(404).json({ message: "Question not found" });
    res.json(q);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/run",  async (req, res) => {
  try {
    const { code, questionId } = req.body;

    const question = await CodingQuestion.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Collect all test cases: legacy input/output pairs + new testCases array
    const testCases = [];
    if (question.input || question.expectedOutput) {
      testCases.push({
        input: question.input || "",
        output: (question.expectedOutput || "").trim(),
        isHidden: false
      });
    }

    if (question.testCases && question.testCases.length > 0) {
      question.testCases.forEach(tc => {
        testCases.push({
          input: tc.input || "",
          output: (tc.output || "").trim(),
          isHidden: tc.isHidden
        });
      });
    }

    if (testCases.length === 0) {
      return res.status(400).json({
        message: "Question missing test cases"
      });
    }

    const results = [];
    let passedCount = 0;

    for (const tc of testCases) {
      const response = await axios.post(
        "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
        {
          source_code: code,
          language_id: 63,
          stdin: tc.input
        }
      );

      const output = (response.data.stdout || "").trim();
      const stderr = response.data.stderr || "";
      const compileError = response.data.compile_output || "";
      const isPassed = output === tc.output;

      if (isPassed) passedCount++;

      results.push({
        input: tc.isHidden ? "[Hidden]" : tc.input,
        output: tc.isHidden ? (isPassed ? "[Hidden]" : output) : output,
        expected: tc.isHidden ? "[Hidden]" : tc.output,
        passed: isPassed,
        isHidden: tc.isHidden,
        stderr: tc.isHidden && isPassed ? "" : stderr,
        compileError: tc.isHidden && isPassed ? "" : compileError
      });
    }

    res.json({
      total: testCases.length,
      passed: passedCount,
      results
    });

  } catch (err) {
    console.error("Code run error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
