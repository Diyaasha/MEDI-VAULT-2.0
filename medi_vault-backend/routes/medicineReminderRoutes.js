const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  createMedicineReminder,
  getMedicineReminders,
  updateMedicineReminder,
  deleteMedicineReminder,
} = require("../controllers/medicineReminderController");

router.route("/")
  .post(protect, createMedicineReminder)
  .get(protect, getMedicineReminders);

router.route("/:id")
  .put(protect, updateMedicineReminder)
  .delete(protect, deleteMedicineReminder);

module.exports = router;
