const TreatmentPlan = require("../models/TreatmentPlan");

// Get all plans of logged-in user
exports.getTreatmentPlans = async (req, res) => {
  try {
    // Do not use .lean() here, so virtuals are included automatically
    const plans = await TreatmentPlan.find({ user: req.user._id }).sort({ startDate: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Create a new treatment plan
exports.createTreatmentPlan = async (req, res) => {
  try {
    const {
      patientName,
      primaryConstitution,
      startDate,
      durationValue,
      durationUnit,
      treatmentModalities,
      treatmentGoals,
      status,
      notes,
    } = req.body;

    if (!durationValue || !durationUnit) {
      return res.status(400).json({ message: "durationValue and durationUnit are required" });
    }

    const plan = new TreatmentPlan({
      user: req.user._id,
      patientName,
      primaryConstitution,
      startDate,
      durationValue,
      durationUnit,
      treatmentModalities,
      treatmentGoals,
      status,
      notes,
    });

    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Update treatment plan by ID
exports.updateTreatmentPlan = async (req, res) => {
  try {
    const plan = await TreatmentPlan.findById(req.params.id);
    if (!plan || plan.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Plan not found" });
    }
    Object.assign(plan, req.body);
    await plan.save();
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete treatment plan by ID
exports.deleteTreatmentPlan = async (req, res) => {
  try {
    const plan = await TreatmentPlan.findById(req.params.id);
    if (!plan || plan.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Plan not found" });
    }
    await plan.deleteOne();
    res.json({ message: "Plan deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
