const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../common/ApiError');
const { HTTP_STATUS } = require('../common/constants');
const config = require('../config');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = config.upload.allowedTypes;

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Invalid file type. Only ${allowedTypes.join(', ')} are allowed.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});

const uploadSingle = upload.single('file');

const uploadAvatar = upload.single('avatar');

const uploadMultiple = upload.array('files', 10);

const handleUpload = (uploadType) => {
  return (req, res, next) => {
    uploadType(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new ApiError(
              HTTP_STATUS.BAD_REQUEST,
              `File size exceeds the limit of ${config.upload.maxFileSize / 1024 / 1024}MB`
            )
          );
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(
            new ApiError(HTTP_STATUS.BAD_REQUEST, 'Too many files uploaded')
          );
        }
        return next(new ApiError(HTTP_STATUS.BAD_REQUEST, err.message));
      }
      if (err) {
        return next(err);
      }
      next();
    });
  };
};

const createUploadMiddleware = (fieldName, maxCount = 1) => {
  if (maxCount === 1) {
    return handleUpload(upload.single(fieldName));
  }
  return handleUpload(upload.array(fieldName, maxCount));
};

module.exports = {
  upload,
  uploadSingle,
  uploadAvatar,
  uploadMultiple,
  handleUpload,
  createUploadMiddleware,
};
