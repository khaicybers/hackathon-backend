const mongoose = require("mongoose");

const UniversitySchema = new mongoose.Schema({
  universityCode: String,
  universityLogo: String,
  universityName: String,
  admissionInformation: String,
  address: String,
  website: String,
  image: String,
});

module.exports = mongoose.model("University", UniversitySchema);
