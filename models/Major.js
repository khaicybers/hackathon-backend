const mongoose = require("mongoose");

const MajorSchema = new mongoose.Schema({
  majorName: String,
});

module.exports = mongoose.model("Major", MajorSchema);
