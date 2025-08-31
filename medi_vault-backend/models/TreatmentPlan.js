const mongoose = require("mongoose");
const { Schema } = mongoose;

const TreatmentPlanSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    patientName: { type: String, required: true },

    primaryConstitution: {
      type: String,
      enum: ["Vata", "Pitta", "Kapha"],
      required: true,
    },

    startDate: { type: Date, required: true },

    durationValue: { type: Number, required: true, min: 1 },

    durationUnit: {
      type: String,
      enum: ["days", "weeks", "months"],
      required: true,
    },

    treatmentModalities: { type: String, required: true },

    treatmentGoals: { type: String },

    status: {
      type: String,
      enum: ["Active", "Completed", "Paused"],
      default: "Active",
    },

    notes: { type: String },
  },
  { timestamps: true }
);

// Optional: Virtual to calculate progress
TreatmentPlanSchema.virtual("calculatedProgressPercent").get(function () {
  if (!this.startDate || !this.durationValue || !this.durationUnit) return 0;

  const start = new Date(this.startDate);
  const now = new Date();

  let totalDays = this.durationValue;
  if (this.durationUnit === "weeks") totalDays *= 7;
  else if (this.durationUnit === "months") totalDays *= 30;

  const elapsedDays = Math.min(
    Math.max((now - start) / (1000 * 60 * 60 * 24), 0),
    totalDays
  );

  return Math.round((elapsedDays / totalDays) * 100);
});

TreatmentPlanSchema.set("toObject", { virtuals: true });
TreatmentPlanSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("TreatmentPlan", TreatmentPlanSchema);
