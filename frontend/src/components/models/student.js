const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  sno: Number,
  rollNo: String,
  department: String,
  section: String,
  name: String,
  quota: String,
  cutoff: Number,
  gender: String,
  H_or_D: String,
  boardOfStudy: String
});

module.exports = mongoose.model("Student", studentSchema);
