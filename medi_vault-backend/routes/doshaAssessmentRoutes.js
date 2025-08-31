const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createAssessment,
  getAssessments,
  getAssessmentById,
} = require("../controllers/doshaAssessmentController");

router.use(protect);

router.post("/", createAssessment);
router.get("/", getAssessments);
router.get("/:id", getAssessmentById);

module.exports = router;
