// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getUserProfileDetails,
  updateUserProfileDetails,
  verifyPasswordForEdit,
} = require("../controllers/userController");

router.get("/profile", protect, getUserProfileDetails);
router.put("/profile", protect, updateUserProfileDetails);
router.post("/profile/verify-password", protect, verifyPasswordForEdit);

module.exports = router;
