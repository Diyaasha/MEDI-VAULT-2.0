const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { createWorker } = require('tesseract.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const MedicalDocument = require("../models/MedicalDocument");

// Initialize Google Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Initialize AWS S3 client (v3)
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
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
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    
    if (!text || text.trim().length < 10) {
      return "Could not extract readable text from this image. The image might be unclear or not contain text.";
    }
    
    return text;
  } else {
    throw new Error(`Unsupported file type for text extraction: ${detectedMimetype || 'unknown'}`);
  }
}

// Enhanced medical report analysis with Gemini
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

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    // Remove markdown code block markers if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    
    const parsedResponse = JSON.parse(cleanContent.trim());
    return parsedResponse;
  } catch (error) {
    // Fallback if JSON parsing fails
    console.warn('Background processing: Failed to parse JSON response from Gemini, using fallback');
    return {
      summary: "Document processed with basic analysis. Please consult your healthcare provider for detailed interpretation.",
      keyFindings: ["Medical document processed - content extracted"],
      suggestions: ["Regular monitoring and follow-up with your healthcare team is recommended", "Maintain a balanced diet and regular exercise"],
      followUp: "Consult your doctor for detailed interpretation."
    };
  }
}

// Process documents missing AI analysis
async function processPendingDocuments() {
  try {
    // Find documents that need AI processing (limit to 3 to avoid overloading)
    const docs = await MedicalDocument.find({
      $or: [
        { category: "ai-simplified", "details.aiSummary": { $exists: false } },
        { category: { $ne: "ai-simplified" }, fileUrl: { $exists: true, $ne: null }, "details.aiSummary": { $exists: false } }
      ]
    }).limit(3);

    if (docs.length > 0) {
      console.log(`📋 Processing ${docs.length} documents in background`);
    }

    for (const doc of docs) {
      try {
        if (!doc.fileUrl) {
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
        console.log(`✅ AI analysis completed for document: ${doc.title}`);
      } catch (error) {
        // Handle S3 file not found errors gracefully
        if (error.name === 'NoSuchKey' || error.message.includes('does not exist') || error.message.includes('NoSuchKey')) {
          console.log(`⚠️  Skipping document "${doc.title}" - file not accessible in S3`);
          
          // Mark as processed with a note about the missing file
          doc.details = { 
            ...doc.details, 
            aiSummary: 'Document file not accessible - please re-upload if needed',
            aiProcessedAt: new Date(),
            skipped: true,
            skipReason: 'S3 file not found'
          };
          await doc.save();
        } else {
          console.error(`❌ Error processing document ${doc._id}:`, error.message);
        }
      }
    }
  } catch (err) {
    console.error("Background processing error:", err.message);
  }
}

let processingInterval;

// Start background processing
function startBackgroundProcessing() {
  console.log('🤖 Starting background document processor');
  
  // Process immediately on startup (after a short delay to let server fully start)
  setTimeout(() => {
    processPendingDocuments();
  }, 10000); // 10 seconds delay
  
  // Then process every 10 minutes to be gentle on resources
  processingInterval = setInterval(processPendingDocuments, 10 * 60 * 1000);
}

// Stop background processing (for cleanup)
function stopBackgroundProcessing() {
  if (processingInterval) {
    clearInterval(processingInterval);
    console.log('🛑 Stopped background document processor');
  }
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🔄 Graceful shutdown initiated');
  stopBackgroundProcessing();
});

process.on('SIGINT', () => {
  console.log('🔄 Graceful shutdown initiated');
  stopBackgroundProcessing();
});

module.exports = {
  startBackgroundProcessing,
  stopBackgroundProcessing,
  processPendingDocuments // Export for manual triggering if needed
};