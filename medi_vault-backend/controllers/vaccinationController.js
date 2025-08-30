// controllers/vaccinationController.js
const Vaccination = require("../models/Vaccination");

// Get all vaccinations for logged-in user
exports.getVaccinations = async (req, res) => {
  try {
    const vaccinations = await Vaccination.find({ user: req.user._id }).sort({ date: -1 });
    res.json(vaccinations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vaccination by ID
exports.getVaccinationById = async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id);
    if (!vaccination || vaccination.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Vaccination record not found" });
    }
    res.json(vaccination);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new vaccination record
exports.createVaccination = async (req, res) => {
  try {
    const vaccination = new Vaccination({ ...req.body, user: req.user._id });
    await vaccination.save();
    res.status(201).json(vaccination);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update vaccination record by ID
exports.updateVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id);
    if (!vaccination || vaccination.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Vaccination record not found" });
    }
    Object.assign(vaccination, req.body);
    await vaccination.save();
    res.json(vaccination);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete vaccination record by ID
exports.deleteVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id);
    if (!vaccination || vaccination.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Vaccination record not found" });
    }
    await vaccination.deleteOne();
    res.json({ message: "Vaccination record deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
