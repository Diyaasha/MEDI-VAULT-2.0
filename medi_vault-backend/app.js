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

const passport = require('./config/passport');
const session = require('express-session');


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

// API routes
app.use("/api/auth", authRoutes);

app.use("/api/medicine-reminders", medicineReminderRoutes);

app.use("/api/user", userRoutes);

app.use("/api/medical-facilities", medicalFacilityRoutes);

app.use("/api/medical-history", medicalHistoryRoutes);

app.use("/api/ai-simplified", aiSimplifiedRoutes);



// Error handling middleware (must be last)
app.use(errorHandler); // <-- corrected here

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
