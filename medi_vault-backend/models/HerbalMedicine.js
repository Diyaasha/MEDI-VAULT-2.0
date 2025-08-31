const mongoose = require("mongoose");

const HerbalMedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  botanicalName: { type: String },
  formulation: { type: String }, // e.g., powder, decoction, tablet
  dosageForm: { type: String },
  usage: { type: String },
  stockQuantity: { type: Number, default: 0 },
  expiryDate: { type: Date },
  supplier: { type: String },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("HerbalMedicine", HerbalMedicineSchema);
