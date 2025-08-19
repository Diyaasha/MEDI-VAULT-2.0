const MedicineReminder = require("../models/MedicineReminder");

// Create new medicine reminder
exports.createMedicineReminder = async (req, res) => {
  try {
    const reminder = new MedicineReminder({
      ...req.body,
      user: req.user._id,  // from auth middleware
    });
    await reminder.save();
    res.status(201).json(reminder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all reminders for logged-in user
exports.getMedicineReminders = async (req, res) => {
  try {
    const reminders = await MedicineReminder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update reminder by ID
exports.updateMedicineReminder = async (req, res) => {
  try {
    const reminder = await MedicineReminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json(reminder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete reminder by ID
exports.deleteMedicineReminder = async (req, res) => {
  try {
    const reminder = await MedicineReminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json({ message: "Reminder deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
