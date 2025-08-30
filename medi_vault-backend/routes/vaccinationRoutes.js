// routes/vaccinationRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getVaccinations,
  getVaccinationById,
  createVaccination,
  updateVaccination,
  deleteVaccination,
} = require("../controllers/vaccinationController");

router.use(protect);

router.get("/", getVaccinations);
router.get("/:id", getVaccinationById);
router.post("/", createVaccination);
router.put("/:id", updateVaccination);
router.delete("/:id", deleteVaccination);

module.exports = router;
