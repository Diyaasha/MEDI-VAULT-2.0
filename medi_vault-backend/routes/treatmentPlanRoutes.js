const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getTreatmentPlans,
  createTreatmentPlan,
  updateTreatmentPlan,
  deleteTreatmentPlan,
} = require("../controllers/treatmentPlanController");

router.use(protect);

router.get("/", getTreatmentPlans);
router.post("/", createTreatmentPlan);
router.put("/:id", updateTreatmentPlan);
router.delete("/:id", deleteTreatmentPlan);

module.exports = router;
