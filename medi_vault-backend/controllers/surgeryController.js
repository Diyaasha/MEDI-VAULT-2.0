// controllers/surgeryController.js
const Surgery = require("../models/Surgery");

// Get all surgeries for logged-in user
exports.getSurgeries = async (req, res) => {
  try {
    const surgeries = await Surgery.find({ user: req.user._id }).sort({ date: -1 });
    res.json(surgeries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get surgery by ID
exports.getSurgeryById = async (req, res) => {
  try {
    const surgery = await Surgery.findById(req.params.id);
    if (!surgery || surgery.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Surgery record not found" });
    }
    res.json(surgery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new surgery record
exports.createSurgery = async (req, res) => {
  try {
    const surgery = new Surgery({ ...req.body, user: req.user._id });
    await surgery.save();
    res.status(201).json(surgery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update surgery record by ID
exports.updateSurgery = async (req, res) => {
  try {
    const surgery = await Surgery.findById(req.params.id);
    if (!surgery || surgery.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Surgery record not found" });
    }
    Object.assign(surgery, req.body);
    await surgery.save();
    res.json(surgery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete surgery record by ID
exports.deleteSurgery = async (req, res) => {
  try {
    const surgery = await Surgery.findById(req.params.id);
    if (!surgery || surgery.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Surgery record not found" });
    }
    await surgery.deleteOne();
    res.json({ message: "Surgery record deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
