const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // your existing multerS3 middleware

const {
  uploadAndSummarize,
  listAiSimplifiedDocs,
  getMedicalHistoryForAI,
  processExistingDocument,
} = require("../controllers/aiSimplifiedController");

router.post("/upload", protect, upload.single("file"), uploadAndSummarize);
router.get("/list", protect, listAiSimplifiedDocs);
router.get("/medical-history", protect, getMedicalHistoryForAI);
router.post("/process/:documentId", protect, processExistingDocument);

module.exports = router;
