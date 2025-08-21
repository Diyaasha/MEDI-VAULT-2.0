const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require("./middleware/errorMiddleware"); // Correct import
const authRoutes = require("./routes/authRoutes");
const medicineReminderRoutes = require("./routes/medicineReminderRoutes");
const userRoutes = require("./routes/userRoutes");
const medicalFacilityRoutes = require("./routes/medicalFacilityRoutes");


dotenv.config(); // Load .env file

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json()); // For JSON body parsing
app.use(express.urlencoded({ extended: true })); // For form data

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Your frontend URL
    credentials: true, // Allow cookies & headers
  })
);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running fine 🚀",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// API routes
app.use("/api/auth", authRoutes);

app.use("/api/medicine-reminders", medicineReminderRoutes);

app.use("/api/user", userRoutes);

app.use("/api/medical-facilities", medicalFacilityRoutes);


// Error handling middleware (must be last)
app.use(errorHandler); // <-- corrected here

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
