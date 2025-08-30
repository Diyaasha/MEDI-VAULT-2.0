// routes/surgeryRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getSurgeries,
  getSurgeryById,
  createSurgery,
  updateSurgery,
  deleteSurgery,
} = require("../controllers/surgeryController");

router.use(protect);

router.get("/", getSurgeries);
router.get("/:id", getSurgeryById);
router.post("/", createSurgery);
router.put("/:id", updateSurgery);
router.delete("/:id", deleteSurgery);

module.exports = router;
