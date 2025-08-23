const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { 
  addUploadedDocument, 
  getDocuments, 
  addManualDocument, 
  verifyPassword,
  getSignedUrlForDocument,
  deleteDocument,
} = require("../controllers/medicalHistoryController");

router.use(protect);

router.get("/", getDocuments);
router.get("/download-url/:id", getSignedUrlForDocument);
router.post("/manual", addManualDocument);
router.post("/upload", upload.single("file"), addUploadedDocument);
router.delete("/:id", protect, deleteDocument);
router.post("/verify-password", verifyPassword);

module.exports = router;
