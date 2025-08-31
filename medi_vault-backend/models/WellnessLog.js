const mongoose = require("mongoose");

const WellnessLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    date: { type: Date, required: true, unique: true }, // One log per user per day ideally with a compound index on user+date

    mood: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
      // Optionally add custom validation or enum for moods
    },

    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
    },

    energyLevel: {
      type: Number,
      min: 1,
      max: 10,
    },

    dietNotes: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Create a compound index to ensure only one log per user per date
WellnessLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("WellnessLog", WellnessLogSchema);
