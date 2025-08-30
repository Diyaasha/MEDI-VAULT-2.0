require('dotenv').config();

const connectDB = require("../config/db"); // Import MongoDB connection
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const OpenAI = require("openai");
const MedicalDocument = require("../models/MedicalDocument");

// Connect to MongoDB before DB operations
connectDB().then(() => {
  console.log("MongoDB connected successfully");

  // Start processing documents now and every 5 minutes
  processPendingDocuments();
  setInterval(processPendingDocuments, 5 * 60 * 1000);
}).catch((err) => {
  console.error("Error connecting to MongoDB:", err);
});

// Initialize AWS S3 client (v3)
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to convert S3 GetObjectCommand stream to Buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Extract text from S3 file buffer based on mimetype
async function extractTextFromS3(bucket, key, mimetype) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3Client.send(command);

  // Convert stream to buffer
  const buffer = await streamToBuffer(response.Body);

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

// Summarize text via OpenAI GPT-4
async function summarizeText(text) {
  if (!text.trim()) return "No content to summarize.";

  const prompt = `Simplify and summarize this medical or insurance document content:\n\n${text}`;
  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 300,
  });

  return completion.data.choices[0].message.content.trim();
}

// Process documents missing AI summary
async function processPendingDocuments() {
  try {
    const docs = await MedicalDocument.find({
      category: "ai-simplified",
      "details.aiSummary": { $exists: false },
    }).limit(5);

    for (const doc of docs) {
      const url = new URL(doc.fileUrl);
      const key = url.pathname.slice(1);

      const text = await extractTextFromS3(process.env.AWS_S3_BUCKET_NAME, key, doc.mimetype);

      const summary = await summarizeText(text);

      doc.details = { ...doc.details, aiSummary: summary };
      await doc.save();

      console.log(`Processed summary for doc ${doc._id}`);
    }
  } catch (err) {
    console.error("Error processing AI simplified docs:", err);
  }
}

// Run job at startup and every 5 minutes
processPendingDocuments();
setInterval(processPendingDocuments, 5 * 60 * 1000);
