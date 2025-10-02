const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { createWorker } = require('tesseract.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const MedicalDocument = require("../models/MedicalDocument");

// Initialize Google Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
async function extractTextFromFile(buffer, mimetype, originalFileName = '') {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("File buffer is not valid");
  }
  
  // Extracting text from file

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
      default:
        console.warn(`Cannot determine file type from extension: ${ext}`);
    }
    // Detected mimetype from filename
  }

  try {
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
        return "Could not extract readable text from this image. The image might be unclear or not contain text. Please try uploading a clearer image or convert to PDF format.";
      }
      
      // OCR extraction completed
      return text;
    } else {
      throw new Error(`Unsupported file type for text extraction: ${detectedMimetype || 'unknown'}`);
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

// Rule-based medical analysis fallback (works for various medical reports)
function analyzeBloodTestValues(text) {
  const analysis = {
    summary: "Medical report analysis based on common patterns and values found in the document:",
    keyFindings: [],
    suggestions: [],
    followUp: "Consult your doctor for detailed interpretation."
  };
  
  // Extract common blood test values using regex
  const hemoglobinMatch = text.match(/(?:hemoglobin|hb)\s*:?\s*(\d+\.?\d*)\s*(?:g\/dl|g\/L)?/i);
  const wbcMatch = text.match(/(?:wbc|white blood cell|total wbc)\s*:?\s*(\d+)\s*(?:\/cmm|\/mm3)?/i);
  const rbcMatch = text.match(/(?:rbc|red blood cell)\s*:?\s*(\d+\.?\d*)\s*(?:mil\/cmm)?/i);
  const plateletsMatch = text.match(/(?:platelets?)\s*:?\s*(\d+)\s*(?:\/cmm|k\/uL)?/i);
  
  if (hemoglobinMatch) {
    const hb = parseFloat(hemoglobinMatch[1]);
    if (hb < 12) {
      analysis.keyFindings.push(`Low Hemoglobin (${hb} g/dl) - below normal range (12-16)`);
      analysis.suggestions.push("Consider iron-rich foods like spinach, red meat, and beans");
      analysis.suggestions.push("Consult doctor about possible anemia");
    } else if (hb > 16) {
      analysis.keyFindings.push(`High Hemoglobin (${hb} g/dl) - above normal range (12-16)`);
      analysis.suggestions.push("Stay well hydrated");
      analysis.suggestions.push("Consult hematologist for elevated hemoglobin");
    } else {
      analysis.keyFindings.push(`Normal Hemoglobin (${hb} g/dl) - within normal range`);
    }
  }
  
  if (wbcMatch) {
    const wbc = parseInt(wbcMatch[1]);
    if (wbc < 4000) {
      analysis.keyFindings.push(`Low WBC Count (${wbc}) - below normal (4000-11000)`);
      analysis.suggestions.push("Monitor for infections, boost immunity with proper nutrition");
    } else if (wbc > 11000) {
      analysis.keyFindings.push(`High WBC Count (${wbc}) - above normal (4000-11000)`);
      analysis.suggestions.push("May indicate infection or inflammation - consult doctor");
    } else {
      analysis.keyFindings.push(`Normal WBC Count (${wbc}) - within normal range`);
    }
  }
  
  if (plateletsMatch) {
    const platelets = parseInt(plateletsMatch[1]);
    if (platelets < 150000) {
      analysis.keyFindings.push(`Low Platelets (${platelets}) - below normal (150000-450000)`);
      analysis.suggestions.push("Avoid activities with bleeding risk, consult hematologist");
    } else if (platelets > 450000) {
      analysis.keyFindings.push(`High Platelets (${platelets}) - above normal (150000-450000)`);
      analysis.suggestions.push("Monitor for clotting issues, stay hydrated");
    }
  }
  
  if (analysis.keyFindings.length === 0) {
    analysis.keyFindings.push("Medical values and information extracted from document - please review with healthcare provider");
    analysis.suggestions.push("Regular monitoring and follow-up with your healthcare team is recommended");
  }
  
  // Always add general health suggestions
  analysis.suggestions.push("Maintain a balanced diet and regular exercise");
  analysis.suggestions.push("Schedule regular check-ups with your healthcare provider");
  
  return analysis;
}

// Enhanced medical report analysis with Gemini (with fallback)
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
    // Processing with Gemini AI
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    // AI analysis completed

    try {
      // Remove markdown code block markers if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      
      const parsedResponse = JSON.parse(cleanContent.trim());
      return parsedResponse;
    } catch (parseError) {
      // Fallback if JSON parsing fails
      console.warn('Failed to parse JSON response from Gemini, using fallback:', parseError.message);
      return {
        summary: content.trim(),
        keyFindings: [],
        suggestions: [],
        followUp: "Consult your doctor for detailed interpretation."
      };
    }
  } catch (apiError) {
    console.error('Gemini API error:', apiError.message);
    console.log('Using fallback analysis');
    
    // Use rule-based analysis as fallback
    return analyzeBloodTestValues(text);
  }
}

// Legacy function for backward compatibility
async function summarizeText(text) {
  const analysis = await analyzeMedicalReport(text);
  return analysis.summary || "No content to summarize.";
}

exports.uploadAndSummarize = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Download file buffer from S3
    const buffer = await getBufferFromS3Url(req.file.location);

    // File downloaded from S3

    // Extract text from downloaded buffer
    const text = await extractTextFromFile(buffer, req.file.mimetype, req.file.originalname);

    // Analyze medical report with enhanced AI
    const analysis = await analyzeMedicalReport(text);

    // Save document metadata + AI analysis to MongoDB
    const newDoc = await MedicalDocument.create({
      user: req.user._id,
      fileUrl: req.file.location,
      originalFileName: req.file.originalname,
      mimetype: req.file.mimetype,
      category: "ai-simplified",
      title: req.body.title || req.file.originalname,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      doctor: req.body.doctor || null,
      notes: req.body.notes || null,
      isManual: false,
      details: { 
        aiSummary: analysis.summary,
        keyFindings: analysis.keyFindings,
        suggestions: analysis.suggestions,
        followUp: analysis.followUp,
        extractedText: text.substring(0, 1000) // Store first 1000 chars for reference
      },
    });

    res.status(201).json({ document: newDoc, analysis });
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

// New endpoint: Get all medical history reports for AI processing
exports.getMedicalHistoryForAI = async (req, res) => {
  try {
    // Get all medical history documents (excluding ai-simplified category)
    const medicalHistoryDocs = await MedicalDocument.find({
      user: req.user._id,
      category: { $ne: 'ai-simplified' },
      fileUrl: { $exists: true, $ne: null }
    }).sort({ createdAt: -1 });

    // Get AI-simplified documents
    const aiSimplifiedDocs = await MedicalDocument.find({
      user: req.user._id,
      category: 'ai-simplified'
    }).sort({ createdAt: -1 });

    res.json({
      medicalHistoryReports: medicalHistoryDocs,
      aiSimplifiedReports: aiSimplifiedDocs,
      totalReports: medicalHistoryDocs.length + aiSimplifiedDocs.length
    });
  } catch (error) {
    console.error("Get medical history for AI error:", error);
    res.status(500).json({ message: error.message });
  }
};

// New endpoint: Process existing medical history document with AI
exports.processExistingDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const document = await MedicalDocument.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Verify ownership
    if (document.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if document has a file URL
    if (!document.fileUrl) {
      return res.status(400).json({ message: "Document has no file to process" });
    }

    // Download and extract text
    const buffer = await getBufferFromS3Url(document.fileUrl);
    const text = await extractTextFromFile(buffer, document.mimetype, document.originalFileName);
    
    // Analyze with AI
    const analysis = await analyzeMedicalReport(text);

    // Update document with AI analysis
    document.details = {
      ...document.details,
      aiSummary: analysis.summary,
      keyFindings: analysis.keyFindings,
      suggestions: analysis.suggestions,
      followUp: analysis.followUp,
      extractedText: text.substring(0, 1000),
      aiProcessedAt: new Date()
    };
    
    await document.save();

    res.json({ 
      message: "Document processed successfully", 
      document, 
      analysis 
    });
  } catch (error) {
    console.error("Process existing document error:", error);
    res.status(500).json({ message: error.message });
  }
};

