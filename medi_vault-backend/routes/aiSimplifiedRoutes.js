const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // your existing multerS3 middleware

const {
  uploadAndSummarize,
  listAiSimplifiedDocs,
} = require("../controllers/aiSimplifiedController");

router.post("/upload", protect, upload.single("file"), uploadAndSummarize);
router.get("/list", protect, listAiSimplifiedDocs);

module.exports = router;
