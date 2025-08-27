const express = require("express");
const router = express.Router();
const passport = require("passport");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const { registerUser, loginUser } = require("../controllers/authController");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Local signup and login routes
router.post("/signup", registerUser);
router.post("/login", loginUser);

// Google OAuth login initiation route (uses Passport strategy)
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback route (called by Google after user login)
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = generateToken(req.user.id);
    // Redirect to frontend with JWT token in URL
    const redirectUrl = `${process.env.FRONTEND_URL}/?token=${token}&profileComplete=${req.user.isProfileComplete}`;
    res.redirect(redirectUrl);
  }
);

// Google token verification route for frontend post-login/signup
router.post("/google/verify", async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("Verified token payload:", payload);

    // Look for existing user by email
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      // Create new user automatically if not found
      user = await User.create({
        name:
          payload.name ||
          `${payload.given_name || ""} ${payload.family_name || ""}`.trim() ||
          "User",
        email: payload.email,
        // Provide a dummy password as it's required by your schema
        password: "google_oauth_dummy_password",
        role: "patient", // your app-specific role
    isProfileComplete: false, // new flag
      });
    }

    // Generate a JWT token for your app
    const jwtToken = generateToken(user._id);
//     console.log("Sending user data:", {
//   token: jwtToken,
//   name: user.name,
//   email: user.email,
//   isProfileComplete: user.isProfileComplete,
// });
    // Send back JWT token and user details
    res.json({ token: jwtToken, name: user.name, email: user.email,isProfileComplete: user.isProfileComplete });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Invalid Google token" });
  }
});

module.exports = router;
