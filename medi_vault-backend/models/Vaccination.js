// models/Vaccination.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const VaccinationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  patientName: { type: String, required: true },
  vaccine: { type: String, required: true },
  date: { type: Date, required: true },
  nextDue: { type: Date },
  status: { type: String, required: true },
  batchNumber: { type: String },
  administrator: { type: String },
  sideEffects: { type: String },
  location: { type: String },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Vaccination", VaccinationSchema);
