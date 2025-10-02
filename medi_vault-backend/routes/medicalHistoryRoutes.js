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
// Custom multer error handler
const handleMulterError = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    if (err.message.includes('not allowed')) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(400).json({ message: 'File upload error: ' + err.message });
  }
  next();
};

router.post("/upload", upload.single("file"), handleMulterError, addUploadedDocument);
router.delete("/:id", protect, deleteDocument);
router.post("/verify-password", verifyPassword);

module.exports = router;
