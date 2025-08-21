const express = require("express");
const router = express.Router();
const { getNearbyFacilities } = require("../controllers/medicalFacilityController");

// Public route (no auth needed, or add auth as required)
router.get("/", getNearbyFacilities);

module.exports = router;
