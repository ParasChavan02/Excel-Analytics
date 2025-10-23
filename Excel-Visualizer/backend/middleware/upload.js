const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `excel-${uniqueSuffix}${extension}`);
  }
});

// File filter for Excel files only
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const allowedExtensions = ['.xls', '.xlsx'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xls, .xlsx) are allowed!'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1 // Only allow 1 file at a time
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          message: 'File too large. Maximum size is 10MB.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          message: 'Too many files. Only 1 file is allowed.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          message: 'Unexpected field name for file upload.'
        });
      default:
        return res.status(400).json({
          message: 'File upload error: ' + error.message
        });
    }
  }
  
  if (error) {
    return res.status(400).json({
      message: error.message
    });
  }
  
  next();
};

// Single file upload middleware
const uploadSingle = upload.single('excelFile');

module.exports = {
  uploadSingle,
  handleMulterError
};