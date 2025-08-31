const DoshaAssessment = require("../models/DoshaAssessment");

// Create/save a new assessment with calculated doshas
exports.createAssessment = async (req, res) => {
  try {
    const {
      patientName,
      bodyFrame,
      skinType,
      sleepPattern,
      appetite,
    } = req.body;

    // Validate required fields (add as needed)

    const {
      vataPercent,
      pittaPercent,
      kaphaPercent,
      primaryConstitution,
      recommendations,
    } = calculateDoshas({ bodyFrame, skinType, sleepPattern, appetite });

    const assessment = new DoshaAssessment({
      user: req.user._id,
      patientName,
      bodyFrame,
      skinType,
      sleepPattern,
      appetite,
      vataPercent,
      pittaPercent,
      kaphaPercent,
      primaryConstitution,
      recommendations,
    });

    await assessment.save();
    res.status(201).json(assessment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// List all user's assessments
exports.getAssessments = async (req, res) => {
  try {
    const assessments = await DoshaAssessment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assessment by ID
exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await DoshaAssessment.findById(req.params.id);
    if (!assessment || assessment.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function calculateDoshas(answers) {
  const { bodyFrame, skinType, sleepPattern, appetite } = answers;

  let vata = 0, pitta = 0, kapha = 0;

  // Body frame points
  if (bodyFrame === "Thin, light") vata += 3;
  else if (bodyFrame === "Medium build") pitta += 3;
  else if (bodyFrame === "Large, heavy") kapha += 3;

  // Skin type points
  if (skinType === "Dry, rough") vata += 3;
  else if (skinType === "Warm, oily") pitta += 3;
  else if (skinType === "Cool, moist") kapha += 3;

  // Sleep pattern points
  if (sleepPattern === "Light, restless") vata += 3;
  else if (sleepPattern === "Sound, moderate") pitta += 3;
  else if (sleepPattern === "Deep, long") kapha += 3;

  // Appetite points
  if (appetite === "Variable, irregular") vata += 3;
  else if (appetite === "Strong, regular") pitta += 3;
  else if (appetite === "Slow, steady") kapha += 3;

  const total = vata + pitta + kapha;
  const vataPercent = Math.round((vata / total) * 100);
  const pittaPercent = Math.round((pitta / total) * 100);
  const kaphaPercent = 100 - vataPercent - pittaPercent;

  // Determine primary constitution
  let primaryConstitution = "Vata";
  if (pitta >= vata && pitta >= kapha) primaryConstitution = "Pitta";
  else if (kapha >= vata && kapha >= pitta) primaryConstitution = "Kapha";

  // Generate recommendations - example simple
  const recommendationsMap = {
    Vata: "- Warm, oily foods\n- Regular routine\n- Avoid cold environments",
    Pitta: "- Cooling foods and beverages\n- Avoid spicy and acidic foods\n- Moderate exercise",
    Kapha: "- Light, dry foods\n- Regular physical activity\n- Avoid heavy meals",
  };

  const recommendations = recommendationsMap[primaryConstitution];

  return { vataPercent, pittaPercent, kaphaPercent, primaryConstitution, recommendations };
}
