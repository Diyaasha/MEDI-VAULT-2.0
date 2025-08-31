const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware"); // if you use auth
const {
  getHerbalMedicines,
  getHerbalMedicineById,
  createHerbalMedicine,
  updateHerbalMedicine,
  deleteHerbalMedicine,
} = require("../controllers/herbalMedicineController");

// Protect all routes to authenticated users
router.use(protect);

router.route("/")
  .get(getHerbalMedicines)
  .post(createHerbalMedicine);

router.route("/:id")
  .get(getHerbalMedicineById)
  .put(updateHerbalMedicine)
  .delete(deleteHerbalMedicine);

module.exports = router;
