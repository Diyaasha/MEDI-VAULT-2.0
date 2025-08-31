const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware"); // Adjust as per your auth setup
const {
  getWellnessLogs,
  getWellnessLogById,
  createWellnessLog,
  updateWellnessLog,
  deleteWellnessLog,
} = require("../controllers/wellnessLogController");

router.use(protect);

router.route("/")
  .get(getWellnessLogs)
  .post(createWellnessLog);

router.route("/:id")
  .get(getWellnessLogById)
  .put(updateWellnessLog)
  .delete(deleteWellnessLog);

module.exports = router;
