const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes'); // ✅ use the dedicated auth routes
app.use('/api/auth', authRoutes);

// Connect to DB and start server
connectDB().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`✅ Server running on port ${process.env.PORT || 3000}`);
  });
});

// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const connectDB = require('./config/db');
// const app = express();

// dotenv.config();
// app.use(cors());
// app.use(cors({ origin: 'http://localhost:5173' }));
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// const users = [];
// // app.post("/signup", (req, res) => {
// //   const { name, email, password } = req.body;
// //   const existing = users.find(u => u.email === email);

// //   if (existing) {
// //     return res.status(400).json({ message: "Email already registered" });
// //   }
// //   console.log("Received signup data:", { name, email, password });
// //   const newUser = { name, email, password };
// //   users.push(newUser);

// //   res.status(201).json({ message: "Signup successful", user: newUser });
// // });
// app.post("/signup", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Check if email exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already registered" });
//     }

//     // Create user in DB
//     const newUser = new User({ name, email, password });
//     await newUser.save();

//     res.status(201).json({ message: "Signup successful", user: newUser });
//   } catch (error) {
//     console.error("Signup error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// // app.post("/login", (req, res) => {
// //   const { email, password } = req.body;
// //   const user = users.find(u => u.email === email && u.password === password);

// //   if (!user) {
// //     return res.status(401).json({ message: "Invalid email or password" });
// //   }

// //   res.status(200).json({ message: "Login successful", user });
// // });
// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if user exists
//     const user = await User.findOne({ email, password });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     res.status(200).json({ message: "Login successful", user });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// // Routes
// const authRoutes = require('./routes');
// app.use('/api/auth', authRoutes);

// connectDB().then(() => {
//   app.listen(process.env.PORT || 3000, () => {
//     console.log(`Server running on port ${process.env.PORT || 3000}`);
//   });
// });