const WellnessLog = require("../models/WellnessLog");

// Get all wellness logs for the logged-in user, optionally filtered by date range
exports.getWellnessLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const logs = await WellnessLog.find(query).sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single wellness log by ID
exports.getWellnessLogById = async (req, res) => {
  try {
    const log = await WellnessLog.findOne({ _id: req.params.id, user: req.user._id });
    if (!log) return res.status(404).json({ message: "Wellness log not found" });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new wellness log (one per day per user)
exports.createWellnessLog = async (req, res) => {
  try {
    const { date, mood, sleepHours, energyLevel, dietNotes, notes } = req.body;

    // Check for existing log for user+date to prevent duplicates
    const existing = await WellnessLog.findOne({ user: req.user._id, date });
    if (existing) {
      return res.status(400).json({ message: "Wellness log for this date already exists" });
    }

    const log = new WellnessLog({
      user: req.user._id,
      date,
      mood,
      sleepHours,
      energyLevel,
      dietNotes,
      notes,
    });

    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update existing wellness log by ID
exports.updateWellnessLog = async (req, res) => {
  try {
    const log = await WellnessLog.findOne({ _id: req.params.id, user: req.user._id });
    if (!log) return res.status(404).json({ message: "Wellness log not found" });

    Object.assign(log, req.body);
    await log.save();
    res.json(log);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete wellness log by ID
exports.deleteWellnessLog = async (req, res) => {
  try {
    const log = await WellnessLog.findOne({ _id: req.params.id, user: req.user._id });
    if (!log) return res.status(404).json({ message: "Wellness log not found" });

    await log.deleteOne();
    res.json({ message: "Wellness log deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
