const dotenv = require('dotenv');
dotenv.config(); // Load .env file
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require("./middleware/errorMiddleware"); // Correct import
const authRoutes = require("./routes/authRoutes");
const medicineReminderRoutes = require("./routes/medicineReminderRoutes");
const userRoutes = require("./routes/userRoutes");
const medicalFacilityRoutes = require("./routes/medicalFacilityRoutes");
const medicalHistoryRoutes = require("./routes/medicalHistoryRoutes");
const aiSimplifiedRoutes = require("./routes/aiSimplifiedRoutes");
const patientQueryRoutes = require("./routes/patientQueryRoutes");

// New route imports
const vaccinationRoutes = require("./routes/vaccinationRoutes");
const surgeryRoutes = require("./routes/surgeryRoutes");

const treatmentRoutes = require("./routes/treatmentRoutes");
const doshaAssessmentRoutes = require("./routes/doshaAssessmentRoutes");
const treatmentPlanRoutes = require("./routes/treatmentPlanRoutes");
const herbalMedicineRoutes = require("./routes/herbalMedicineRoutes");
const wellnessLogRoutes = require("./routes/wellnessLogRoutes");

const passport = require('./config/passport');
const session = require('express-session');
const { startBackgroundProcessing, processPendingDocuments } = require('./services/backgroundProcessor');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json()); // For JSON body parsing
app.use(express.urlencoded({ extended: true })); // For form data

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://medi-vault-zeta.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients and explicitly listed browser origins.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // Allow cookies & headers
  })
);

app.use(session({
  secret: process.env.JWT_SECRET, 
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running fine 🚀",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// Manual trigger for background processing (for testing)
app.post("/api/admin/process-documents", async (req, res) => {
  try {
    console.log('🔄 Manual background processing triggered');
    await processPendingDocuments();
    res.json({ message: "Background processing triggered successfully" });
  } catch (error) {
    console.error('Manual processing error:', error);
    res.status(500).json({ error: "Failed to trigger background processing" });
  }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/medicine-reminders", medicineReminderRoutes);
app.use("/api/user", userRoutes);
app.use("/api/medical-facilities", medicalFacilityRoutes);
app.use("/api/medical-history", medicalHistoryRoutes);
app.use("/api/ai-simplified", aiSimplifiedRoutes);
app.use("/api/patient-query", patientQueryRoutes);

// New backend routes for vaccinations and surgeries
app.use("/api/vaccinations", vaccinationRoutes);
app.use("/api/surgeries", surgeryRoutes);
app.use("/api/treatments", treatmentRoutes);
app.use("/api/dosha-assessments", doshaAssessmentRoutes);
app.use("/api/treatment-plans", treatmentPlanRoutes);
app.use("/api/herbal-medicines", herbalMedicineRoutes);
app.use("/api/wellness-logs", wellnessLogRoutes);

// Error handling middleware (must be last)
app.use(errorHandler); // <-- corrected here

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  
  // Start background document processing
  startBackgroundProcessing();
});
