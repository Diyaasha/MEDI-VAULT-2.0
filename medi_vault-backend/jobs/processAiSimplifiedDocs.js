require('dotenv').config();

const connectDB = require("../config/db"); // Import MongoDB connection
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { createWorker } = require('tesseract.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
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

// Initialize Google Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Helper function to convert S3 GetObjectCommand stream to Buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Extract text from S3 file buffer based on mimetype
async function extractTextFromS3(bucket, key, mimetype, originalFileName = '') {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3Client.send(command);

  // Convert stream to buffer
  const buffer = await streamToBuffer(response.Body);

  // If mimetype is undefined, try to guess from file extension
  let detectedMimetype = mimetype;
  if (!mimetype && originalFileName) {
    const ext = originalFileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        detectedMimetype = 'application/pdf';
        break;
      case 'doc':
        detectedMimetype = 'application/msword';
        break;
      case 'docx':
        detectedMimetype = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'jpg':
      case 'jpeg':
        detectedMimetype = 'image/jpeg';
        break;
      case 'png':
        detectedMimetype = 'image/png';
        break;
    }
    // Detected mimetype from filename
  }

  if (detectedMimetype === "application/pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (
    detectedMimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    detectedMimetype === "application/msword"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (detectedMimetype?.startsWith('image/')) {
    // Use OCR for image files
    // Processing image with OCR
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    
    if (!text || text.trim().length < 10) {
      return "Could not extract readable text from this image. The image might be unclear or not contain text.";
    }
    
    // OCR extraction completed
    return text;
  } else {
    throw new Error(`Unsupported file type for text extraction: ${detectedMimetype || 'unknown'}`);
  }
}

// Enhanced medical report analysis with OpenAI GPT-4
async function analyzeMedicalReport(text) {
  if (!text || text.trim().length === 0) return { summary: "No content to analyze.", suggestions: [] };

  const prompt = `You are a medical AI assistant. Analyze this medical report/document and provide:

1. SIMPLE SUMMARY: Explain the medical report in easy-to-understand language that any patient can understand
2. KEY FINDINGS: List the most important results, values, or observations and what they mean
3. ACTIONABLE SUGGESTIONS: Provide 3-5 specific recommendations for the patient based on the results
4. FOLLOW-UP: Suggest when to see a doctor or get retested if needed

This could be any type of medical document: blood tests, imaging reports, pathology results, doctor visits, prescriptions, etc. Please adapt your analysis accordingly.

Note: This text may come from OCR scanning, so there might be minor spelling errors or formatting issues. Please interpret the medical information as accurately as possible.

Medical Report/Document:\n${text}

Format your response as JSON with keys: summary, keyFindings (array of strings or objects), suggestions (array of strings), followUp (string)`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = response.text();

  try {
    // Remove markdown code block markers if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    
    const parsedResponse = JSON.parse(cleanContent.trim());
    return parsedResponse;
  } catch (error) {
    // Fallback if JSON parsing fails
    console.warn('Background job: Failed to parse JSON response from Gemini, using fallback:', error.message);
    return {
      summary: content.trim(),
      keyFindings: [],
      suggestions: [],
      followUp: "Consult your doctor for detailed interpretation."
    };
  }
}

// Process documents missing AI analysis
async function processPendingDocuments() {
  try {
    // Find documents that need AI processing
    const docs = await MedicalDocument.find({
      $or: [
        { category: "ai-simplified", "details.aiSummary": { $exists: false } },
        { category: { $ne: "ai-simplified" }, fileUrl: { $exists: true, $ne: null }, "details.aiSummary": { $exists: false } }
      ]
    }).limit(5);

    console.log(`Found ${docs.length} documents to process`);

    for (const doc of docs) {
      try {
        if (!doc.fileUrl) {
          console.log(`Skipping doc ${doc._id} - no file URL`);
          continue;
        }

        const url = new URL(doc.fileUrl);
        const key = url.pathname.slice(1);

        const text = await extractTextFromS3(process.env.AWS_S3_BUCKET_NAME, key, doc.mimetype, doc.originalFileName);
        const analysis = await analyzeMedicalReport(text);

        doc.details = { 
          ...doc.details, 
          aiSummary: analysis.summary,
          keyFindings: analysis.keyFindings,
          suggestions: analysis.suggestions,
          followUp: analysis.followUp,
          extractedText: text.substring(0, 1000),
          aiProcessedAt: new Date()
        };
        
        await doc.save();
        console.log(`✅ Processed AI analysis for doc ${doc._id} - ${doc.title}`);
      } catch (error) {
        console.error(`❌ Error processing doc ${doc._id}:`, error.message);
      }
    }
  } catch (err) {
    console.error("Error in processPendingDocuments:", err);
  }
}

// Run job at startup and every 5 minutes
processPendingDocuments();
setInterval(processPendingDocuments, 5 * 60 * 1000);
