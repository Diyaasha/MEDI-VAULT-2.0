const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const OpenAI = require("openai");
const MedicalDocument = require("../models/MedicalDocument");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Helper: convert readable stream to buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Helper: get buffer from S3 file URL
async function getBufferFromS3Url(fileUrl) {
  try {
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading "/"
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });
    const response = await s3Client.send(command);
    const buffer = await streamToBuffer(response.Body);
    return buffer;
  } catch (error) {
    console.error("Error fetching file from S3:", error);
    throw error;
  }
}

// Extract text depending on mimetype
async function extractTextFromFile(buffer, mimetype) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("File buffer is not valid");
  }
  console.log("Extracting text. Buffer length:", buffer.length, "Mimetype:", mimetype);

  if (mimetype === "application/pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimetype === "application/msword"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else {
    throw new Error("Unsupported file type for text extraction");
  }
}

// Summarize extracted text with OpenAI GPT-4
async function summarizeText(text) {
  if (!text || text.trim().length === 0) return "No content to summarize.";

  const prompt = `Simplify and summarize the following medical or insurance document content in plain English:\n\n${text}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 300,
  });

  return completion.choices[0].message.content.trim();
}

exports.uploadAndSummarize = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Download file buffer from S3
    const buffer = await getBufferFromS3Url(req.file.location);

    console.log("Downloaded file from S3. Buffer length:", buffer.length);

    // Extract text from downloaded buffer
    const text = await extractTextFromFile(buffer, req.file.mimetype);

    // Summarize text via OpenAI
    const summary = await summarizeText(text);

    // Save document metadata + AI summary to MongoDB
    const newDoc = await MedicalDocument.create({
      user: req.user._id,
      fileUrl: req.file.location,
      originalFileName: req.file.originalname,
      mimetype: req.file.mimetype,
      category: "ai-simplified",
      title: req.file.originalname,
      date: new Date(),
      isManual: false,
      details: { aiSummary: summary },
    });

    res.status(201).json({ document: newDoc, summary });
  } catch (error) {
    console.error("Upload and summarize error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.listAiSimplifiedDocs = async (req, res) => {
  try {
    const category = req.query.category;
    const filter = { user: req.user._id };

    if (category && category !== "all") {
      filter.category = category;
    }

    const docs = await MedicalDocument.find(filter).sort({ createdAt: -1 });

    res.json(docs);
  } catch (error) {
    console.error("Listing AI simplified docs error:", error);
    res.status(500).json({ message: error.message });
  }
};

