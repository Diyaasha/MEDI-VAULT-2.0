const mongoose = require("mongoose");
const { Schema } = mongoose;

const DoshaAssessmentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  patientName: { type: String, required: true },
  bodyFrame: { type: String, enum: ["Thin, light", "Medium build", "Large, heavy"], required: true },
  skinType: { type: String, enum: ["Dry, rough", "Warm, oily", "Cool, moist"], required: true },
  sleepPattern: { type: String, enum: ["Light, restless", "Sound, moderate", "Deep, long"], required: true },
  appetite: { type: String, enum: ["Variable, irregular", "Strong, regular", "Slow, steady"], required: true },
  vataPercent: { type: Number, required: true },   // Calculated %
  pittaPercent: { type: Number, required: true },
  kaphaPercent: { type: Number, required: true },
  primaryConstitution: { type: String, enum: ["Vata", "Pitta", "Kapha"], required: true },
  recommendations: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("DoshaAssessment", DoshaAssessmentSchema);
