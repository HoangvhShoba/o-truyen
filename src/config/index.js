require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default_access_secret_change_in_production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_change_in_production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    verifyEmailExpiresIn: process.env.JWT_VERIFY_EMAIL_EXPIRES_IN || '24h',
    resetPasswordExpiresIn: process.env.JWT_RESET_PASSWORD_EXPIRES_IN || '1h',
  },

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/api_truyen',
    options: {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
    },
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    enabled: process.env.USE_REDIS_CACHE === 'true',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'api-truyen',
  },

  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    from: {
      email: process.env.EMAIL_FROM || 'noreply@api-truyen.com',
      name: process.env.EMAIL_FROM_NAME || 'API Truyen',
    },
  },

  otruyen: {
    baseUrl: process.env.OTRUYEN_BASE_URL || 'https://otruyen.cc/api',
    apiKey: process.env.OTRUYEN_API_KEY || '',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    apiWindowMs: parseInt(process.env.RATE_LIMIT_API_WINDOW_MS, 10) || 60 * 1000,
    apiMaxRequests: parseInt(process.env.RATE_LIMIT_API_MAX_REQUESTS, 10) || 30,
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },

  swagger: {
    title: process.env.SWAGGER_TITLE || 'API Truyen Documentation',
    version: process.env.SWAGGER_VERSION || '1.0.0',
    description: process.env.SWAGGER_DESCRIPTION || 'Backend API cho web đọc truyện',
    url: process.env.SWAGGER_API_URL || '/api-docs',
  },
};
