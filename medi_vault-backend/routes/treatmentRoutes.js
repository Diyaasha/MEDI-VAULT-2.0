const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getTreatments,
  createTreatment,
  updateTreatment,
  deleteTreatment,
} = require("../controllers/treatmentController");

router.use(protect);

router.get("/", getTreatments);
router.post("/", createTreatment);
router.put("/:id", updateTreatment);
router.delete("/:id", deleteTreatment);

module.exports = router;
