const mongoose = require("mongoose");

const UniversityEntranceExamScoreSchema = new mongoose.Schema({
  universityCode: String,
  majorName: String,
  year: Number,
  universityEntranceExamScore: {
    subjectGroup: [String],
    scores: Number,
    majorCode: String,
  },
});

module.exports = mongoose.model(
  "UniversityEntranceExamScore",
  UniversityEntranceExamScoreSchema
);
