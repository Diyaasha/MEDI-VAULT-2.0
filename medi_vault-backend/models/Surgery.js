// models/Surgery.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const SurgerySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  patientName: { type: String, required: true },
  procedure: { type: String, required: true },
  date: { type: Date, required: true },
  surgeon: { type: String },
  status: { type: String, required: true },
  duration: { type: String },
  anesthesia: { type: String },
  complications: { type: String },
  followUpDate: { type: Date },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Surgery", SurgerySchema);
