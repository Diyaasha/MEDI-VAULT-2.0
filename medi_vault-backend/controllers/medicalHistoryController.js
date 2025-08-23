const MedicalDocument = require("../models/MedicalDocument");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Client = require("../config/s3");

// Get Documents by User grouped by category
exports.getDocuments = async (req, res) => {
  try {
    const docs = await MedicalDocument.find({ user: req.user._id });
    // Optionally group by category on frontend or here
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add manual document entry
exports.addManualDocument = async (req, res) => {
  try {
    const { category, title, date, doctor, notes, details } = req.body;

    if (!category || !title || !date) {
      return res.status(400).json({ message: "Category, title and date are required" });
    }

    const medicalDoc = new MedicalDocument({
      user: req.user._id,
      category,
      title,
      date,
      doctor,
      notes,
      details,   // save dynamic details here
      isManual: true,
    });

    await medicalDoc.save();

    res.status(201).json(medicalDoc);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// Add uploaded document entry
exports.addUploadedDocument = async (req, res) => {
  try {
    const { category, title, date, doctor, notes } = req.body;

    // Check that file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const medicalDoc = new MedicalDocument({
      user: req.user._id,
      category,
      title,
      date,
      doctor,
      notes,
      fileUrl: req.file.location, // multer-s3 provides full S3 URL here
      originalFileName: req.file.originalname,
      isManual: false,
    });

    await medicalDoc.save();

    res.status(201).json(medicalDoc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Verify password before allowing document access (reuse code from profile verifyPasswordForEdit)
exports.verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password is required" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

    res.status(200).json({ message: "Password verified" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate a pre-signed URL for downloading a private S3 document
exports.getSignedUrlForDocument = async (req, res) => {
  try {
    const docId = req.params.id;
    const doc = await MedicalDocument.findById(docId);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if the requester is the owner of the document
    if (doc.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Extract the S3 object key from the full fileUrl
    // Assuming fileUrl looks like: https://bucket-name.s3.region.amazonaws.com/key
    const url = new URL(doc.fileUrl);
    const key = url.pathname.substring(1); // Remove leading "/"

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // expires in 1 hour

    res.json({ url: signedUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await MedicalDocument.findById(req.params.id);

    if (!doc) return res.status(404).json({ message: "Document not found" });

    // Ownership check
    if (doc.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete file from S3 if uploaded
    if (doc.fileUrl) {
      const url = new URL(doc.fileUrl);
      const key = url.pathname.substring(1);

      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
    }

    await doc.deleteOne();

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
