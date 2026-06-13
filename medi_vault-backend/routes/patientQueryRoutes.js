const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  askPatientQuery,
  getSupportedPatientIntents,
  summarizeReport,
} = require("../controllers/patientQueryController");

router.get("/intents", protect, getSupportedPatientIntents);
router.post("/ask", protect, askPatientQuery);
router.get("/summarize-report/:documentId", protect, summarizeReport);

module.exports = router;
