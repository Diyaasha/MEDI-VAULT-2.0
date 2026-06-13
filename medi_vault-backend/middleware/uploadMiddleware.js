const multer = require("multer");
const multerS3 = require("multer-s3-v3");
const s3Client = require("../config/s3");

const useS3Storage = Boolean(
  process.env.AWS_S3_BUCKET_NAME &&
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
);

const storage = useS3Storage
  ? multerS3({
      s3: s3Client,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      acl: "private",
      key: (req, file, cb) => {
        const uniqueSuffix = Date.now().toString();
        cb(null, `medical-history/${req.user._id}/${uniqueSuffix}-${file.originalname}`);
      },
    })
  : multer.memoryStorage();

if (!useS3Storage) {
  console.warn("S3 upload disabled: using in-memory storage.");
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedMimetypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg", 
      "image/png",
      "image/gif"
    ];
    
    if (allowedMimetypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed. Supported: PDF, DOC, DOCX, images`), false);
    }
  },
});

module.exports = upload;
