const Treatment = require("../models/Treatment");

// Get all treatments for the logged-in user
exports.getTreatments = async (req, res) => {
  try {
    const treatments = await Treatment.find({ user: req.user._id }).sort({ startDate: -1 });
    res.json(treatments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new treatment record
exports.createTreatment = async (req, res) => {
  try {
    const treatment = new Treatment({ ...req.body, user: req.user._id });
    await treatment.save();
    res.status(201).json(treatment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a treatment by ID
exports.updateTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id);
    if (!treatment || treatment.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Treatment not found" });
    }
    Object.assign(treatment, req.body);
    await treatment.save();
    res.json(treatment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a treatment by ID
exports.deleteTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id);
    if (!treatment || treatment.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Treatment not found" });
    }
    await treatment.deleteOne();
    res.json({ message: "Treatment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
