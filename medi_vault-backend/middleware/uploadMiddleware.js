const multer = require("multer");
const multerS3 = require("multer-s3-v3");
const s3Client = require("../config/s3");

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    acl: "private",
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now().toString();
      cb(null, `medical-history/${req.user._id}/${uniqueSuffix}-${file.originalname}`);
    },
  }),
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
