const mongoose = require("mongoose");
const { Schema } = mongoose;

const TreatmentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: [
      "Medicine",
      "Therapy",
      "Lifestyle",
      "Diet",
      "Ayurveda",
      "Other",
    ],
    required: true,
  },
  name: { type: String, required: true },   // Name of treatment or medicine
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  dosageFrequency: { type: String },        // e.g. "Twice a day"
  status: {
    type: String,
    enum: ["Planned", "Ongoing", "Completed", "Paused"],
    default: "Planned",
  },
  notes: { type: String },                   // User notes or observations
}, { timestamps: true });

module.exports = mongoose.model("Treatment", TreatmentSchema);
