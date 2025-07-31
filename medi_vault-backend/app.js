const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const app = express();

dotenv.config();
app.use(cors());
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const users = [];
// app.post("/signup", (req, res) => {
//   const { name, email, password } = req.body;

//   // Basic validation
//   if (!name || !email || !password) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   // Normally you'd save to DB here. For now:
//   console.log("Received signup data:", { name, email, password });

//   return res.status(201).json({ message: "Signup successful" });
// });
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   const user = users.find((u) => u.email === email && u.password === password);

//   if (!user) {
//     return res.status(401).json({ message: "Invalid email or password" });
//   }

//   res.status(200).json({ message: "Login successful", user });
// });
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  const existing = users.find(u => u.email === email);

  if (existing) {
    return res.status(400).json({ message: "Email already registered" });
  }
  console.log("Received signup data:", { name, email, password });
  const newUser = { name, email, password };
  users.push(newUser);

  res.status(201).json({ message: "Signup successful", user: newUser });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.status(200).json({ message: "Login successful", user });
});

// Routes
const authRoutes = require('./routes');
app.use('/api/auth', authRoutes);

connectDB().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  });
});
