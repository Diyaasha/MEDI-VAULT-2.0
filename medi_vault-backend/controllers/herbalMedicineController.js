const HerbalMedicine = require("../models/HerbalMedicine");

// Get all herbal medicines
exports.getHerbalMedicines = async (req, res) => {
  try {
    const medicines = await HerbalMedicine.find().sort({ name: 1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single herbal medicine by ID
exports.getHerbalMedicineById = async (req, res) => {
  try {
    const medicine = await HerbalMedicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new herbal medicine
exports.createHerbalMedicine = async (req, res) => {
  try {
    const medicine = new HerbalMedicine(req.body);
    await medicine.save();
    res.status(201).json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update herbal medicine by ID
exports.updateHerbalMedicine = async (req, res) => {
  try {
    const medicine = await HerbalMedicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });

    Object.assign(medicine, req.body);
    await medicine.save();
    res.json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete herbal medicine by ID
exports.deleteHerbalMedicine = async (req, res) => {
  try {
    const medicine = await HerbalMedicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });

    await medicine.deleteOne();
    res.json({ message: "Medicine deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
