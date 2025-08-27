const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: { 
    type: String,
     enum: ['patient', 'doctor', 'admin'], 
     default: 'patient' 
  },
  isProfileComplete: { type: Boolean, default: false },
  dob: { type: Date },
gender: { type: String, enum: ['Male', 'Female', 'Other'] },
bloodGroup: { type: String },
weight: { type: String },
height: { type: String },
eyePowerL: { type: String },
eyePowerR: { type: String },
allergies: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);