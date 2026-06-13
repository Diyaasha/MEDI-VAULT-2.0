const MedicineReminder = require("../models/MedicineReminder");
const Vaccination = require("../models/Vaccination");
const TreatmentPlan = require("../models/TreatmentPlan");
const WellnessLog = require("../models/WellnessLog");
const MedicalDocument = require("../models/MedicalDocument");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Chat session storage (in-memory; keyed by userId string)
const chatSessions = new Map();

function formatDate(dateValue) {
  if (!dateValue) return "N/A";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

// Gather all patient context data from the database
async function gatherPatientContext(userId) {
  const [reminders, vaccinations, treatmentPlans, wellnessLogs, reports] =
    await Promise.all([
      MedicineReminder.find({ user: userId }).sort({ startDate: -1 }).limit(10).lean(),
      Vaccination.find({ user: userId }).sort({ date: -1 }).limit(10).lean(),
      TreatmentPlan.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean(),
      WellnessLog.find({ user: userId }).sort({ date: -1 }).limit(7).lean(),
      MedicalDocument.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

  return { reminders, vaccinations, treatmentPlans, wellnessLogs, reports };
}

// Build a rich system prompt with patient context
function buildSystemPrompt(ctx) {
  const { reminders, vaccinations, treatmentPlans, wellnessLogs, reports } = ctx;

  let context = `You are MediBot, a compassionate and knowledgeable AI health assistant for the MEDI-VAULT platform. 
You help patients understand their health records, answer medical queries, and summarize health reports in simple language.

IMPORTANT GUIDELINES:
- Always respond in clear, friendly, easy-to-understand language
- Never provide a definitive medical diagnosis — always recommend consulting a doctor for serious concerns
- Be empathetic and supportive
- When referencing the patient's data, cite specific values and dates
- For report summaries, break them into: Overview, Key Findings, Recommendations, and Follow-up
- Keep responses concise but thorough

PATIENT'S HEALTH DATA:
`;

  if (reminders.length > 0) {
    context += "\n## Medicine Reminders:\n";
    reminders.forEach((r, i) => {
      context += `${i + 1}. ${r.medicineName} — ${r.dose} — ${r.frequency} (from ${formatDate(r.startDate)}${r.endDate ? ` to ${formatDate(r.endDate)}` : ""})\n`;
    });
  } else {
    context += "\n## Medicine Reminders: None recorded\n";
  }

  if (vaccinations.length > 0) {
    context += "\n## Vaccinations:\n";
    vaccinations.forEach((v, i) => {
      context += `${i + 1}. ${v.vaccine} for ${v.patientName} — ${v.status} on ${formatDate(v.date)}${v.nextDue ? ` | Next due: ${formatDate(v.nextDue)}` : ""}\n`;
    });
  } else {
    context += "\n## Vaccinations: None recorded\n";
  }

  if (treatmentPlans.length > 0) {
    context += "\n## Treatment Plans:\n";
    treatmentPlans.forEach((t, i) => {
      context += `${i + 1}. ${t.patientName} — ${t.treatmentModalities} — Status: ${t.status} (${t.durationValue} ${t.durationUnit})\n`;
    });
  } else {
    context += "\n## Treatment Plans: None recorded\n";
  }

  if (wellnessLogs.length > 0) {
    context += "\n## Recent Wellness Logs (last 7 days):\n";
    wellnessLogs.forEach((w, i) => {
      context += `${i + 1}. ${formatDate(w.date)} — Mood: ${w.mood ?? "N/A"}/10 | Sleep: ${w.sleepHours ?? "N/A"}h | Energy: ${w.energyLevel ?? "N/A"}/10${w.notes ? ` | Notes: ${w.notes}` : ""}\n`;
    });
  } else {
    context += "\n## Wellness Logs: None recorded\n";
  }

  if (reports.length > 0) {
    context += "\n## Medical Documents / Reports:\n";
    reports.forEach((r, i) => {
      context += `${i + 1}. "${r.title}" (${r.category}) — Date: ${formatDate(r.date)}${r.doctor ? ` | Doctor: ${r.doctor}` : ""}\n`;
      if (r.details?.aiSummary) {
        context += `   AI Summary: ${String(r.details.aiSummary).substring(0, 300)}...\n`;
      }
      if (r.details?.keyFindings?.length > 0) {
        context += `   Key Findings: ${r.details.keyFindings.slice(0, 3).join("; ")}\n`;
      }
      if (r.details?.extractedText) {
        context += `   Report Excerpt: ${String(r.details.extractedText).substring(0, 500)}\n`;
      }
    });
  } else {
    context += "\n## Medical Documents / Reports: None uploaded yet\n";
  }

  context += `
\nAnswer the patient's questions using both their personal health data above AND your general medical knowledge. 
If asked to summarize a report, provide a detailed patient-friendly summary.
Always end responses about serious health concerns with: "Please consult your doctor for personalized medical advice."
`;

  return context;
}

// Get or create a chat session for a user
function getOrCreateChatSession(userId, systemPrompt) {
  const key = userId.toString();
  if (!chatSessions.has(key)) {
    const chat = model.startChat({
      history: [],
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });
    chatSessions.set(key, { chat, createdAt: Date.now() });
  }
  return chatSessions.get(key).chat;
}

// Clear old sessions (older than 30 minutes) to prevent memory leaks
function cleanupOldSessions() {
  const thirtyMinutes = 30 * 60 * 1000;
  const now = Date.now();
  for (const [key, session] of chatSessions.entries()) {
    if (now - session.createdAt > thirtyMinutes) {
      chatSessions.delete(key);
    }
  }
}
setInterval(cleanupOldSessions, 10 * 60 * 1000);

const SUPPORTED_INTENTS = [
  { intent: "general_health", description: "Answer any health or medical question", examples: ["What is diabetes?", "How can I improve my sleep?"] },
  { intent: "medication_schedule", description: "Medicine and dosage reminder questions", examples: ["What medicine should I take today?"] },
  { intent: "vaccination_status", description: "Vaccination history and due dates", examples: ["When is my next vaccine due?"] },
  { intent: "treatment_progress", description: "Treatment plan status and progress", examples: ["How is my treatment plan going?"] },
  { intent: "wellness_trend", description: "Wellness logs: mood, sleep, energy trends", examples: ["How was my wellness this week?"] },
  { intent: "report_summary", description: "Summarize medical reports in simple language", examples: ["Summarize my recent reports", "What does my blood test say?"] },
];

exports.getSupportedPatientIntents = async (req, res) => {
  return res.status(200).json({
    message: "Supported patient query intents",
    intents: SUPPORTED_INTENTS,
  });
};

exports.askPatientQuery = async (req, res) => {
  try {
    const query = req.body?.query;
    const resetSession = req.body?.resetSession === true;

    if (typeof query !== "string" || query.trim().length < 2) {
      return res.status(400).json({
        message: "Please provide a valid query with at least 2 characters.",
      });
    }

    const userId = req.user._id;
    const cleanQuery = query.trim();

    // Reset session if requested (new conversation)
    if (resetSession) {
      chatSessions.delete(userId.toString());
    }

    // Gather patient context from DB
    const ctx = await gatherPatientContext(userId);
    const systemPrompt = buildSystemPrompt(ctx);

    // Get or create Gemini chat session with multi-turn support
    const chat = getOrCreateChatSession(userId, systemPrompt);

    // Send message to Gemini
    const result = await chat.sendMessage(cleanQuery);
    const response = await result.response;
    const answer = response.text();

    return res.status(200).json({
      query: cleanQuery,
      answer,
      disclaimer:
        "This AI chatbot provides informational support only and does not replace professional medical advice. Always consult a qualified healthcare provider for medical decisions.",
      patientDataUsed: {
        medicineReminders: ctx.reminders.length,
        vaccinations: ctx.vaccinations.length,
        treatmentPlans: ctx.treatmentPlans.length,
        wellnessLogs: ctx.wellnessLogs.length,
        reports: ctx.reports.length,
      },
    });
  } catch (error) {
    console.error("Patient query AI error:", error);

    // Clear potentially corrupt session on error
    if (req.user?._id) {
      chatSessions.delete(req.user._id.toString());
    }

    return res.status(500).json({
      message: "Failed to process your query. Please try again.",
      error: error.message,
    });
  }
};

// Endpoint: Summarize a specific report by document ID
exports.summarizeReport = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await MedicalDocument.findById(documentId).lean();
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Build content to summarize
    const parts = [];
    if (document.title) parts.push(`Title: ${document.title}`);
    if (document.date) parts.push(`Date: ${formatDate(document.date)}`);
    if (document.doctor) parts.push(`Doctor: ${document.doctor}`);
    if (document.notes) parts.push(`Notes: ${document.notes}`);
    if (document.details?.aiSummary) parts.push(`Existing AI Summary: ${document.details.aiSummary}`);
    if (document.details?.keyFindings?.length > 0)
      parts.push(`Key Findings: ${document.details.keyFindings.join(", ")}`);
    if (document.details?.extractedText)
      parts.push(`Report Content:\n${document.details.extractedText}`);

    const reportText = parts.join("\n");

    const prompt = `You are MediBot, a medical AI assistant. Please provide a comprehensive, patient-friendly summary of this medical document/report.

Structure your response as:
## 📋 Report Overview
[1-2 sentence summary of what this report is about]

## 🔍 Key Findings
[Bullet points of the most important findings, in simple language]

## 💡 What This Means For You
[Explain the implications for the patient in plain language]

## ✅ Recommendations
[3-5 actionable recommendations based on the report]

## 🗓️ Follow-up
[When should they see a doctor / get retested]

Medical Document:
${reportText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return res.status(200).json({
      documentId,
      documentTitle: document.title,
      summary,
      disclaimer:
        "This summary is AI-generated for informational purposes. Please consult your doctor for professional medical interpretation.",
    });
  } catch (error) {
    console.error("Report summarization error:", error);
    return res.status(500).json({
      message: "Failed to summarize report.",
      error: error.message,
    });
  }
};
