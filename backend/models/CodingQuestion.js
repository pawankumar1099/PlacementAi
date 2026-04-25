const mongoose = require("mongoose");

const codingQuestionSchema = new mongoose.Schema({
  title: String,
  description: String,
  input: String,
  expectedOutput: String,
  testCases: [
    {
      input: String,
      output: String,
      isHidden: { type: Boolean, default: false }
    }
  ],
  company: String
});

module.exports = mongoose.model("CodingQuestion", codingQuestionSchema);