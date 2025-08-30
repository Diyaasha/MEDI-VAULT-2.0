const mongoose = require("mongoose");
const { Schema } = mongoose;

const MedicalDocumentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  category: {  
  type: String,  
  enum: [
    'lab',
    'imaging',
    'prescription',
    'visit-summary',
    'immunization',
    'insurance',
    'specialist',
    'emergency',
    'uploaded',
    'symptoms',
    'vitals',
    'medication',
    'consultation',
    'general',
    'other'
  ],
  required: true  
},
  title: { type: String, required: true },
  date: { type: Date, required: true },
  doctor: { type: String },            // for doctor visit category
  notes: { type: String },
  fileUrl: { type: String },
  originalFileName: { type: String },
  mimetype: { type: String },
  details: { type: Schema.Types.Mixed },  // <-- New field for dynamic data
  isManual: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("MedicalDocument", MedicalDocumentSchema);
