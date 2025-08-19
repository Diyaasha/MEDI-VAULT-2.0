const mongoose = require("mongoose");

const MedicineReminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  medicineName: {
    type: String,
    required: true,
  },
  dose: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

const MedicineReminder = mongoose.model("MedicineReminder", MedicineReminderSchema);

module.exports = MedicineReminder;
