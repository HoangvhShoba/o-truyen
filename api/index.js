const mongoose = require('mongoose');
const app = require('../src/app');

let isConnected = false;

const connectToDatabase = async () => {
  console.log('[DB-1] Checking MongoDB connection...');

  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('[DB-2] Using existing MongoDB connection');
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('[DB-ERROR] MONGODB_URI is not defined');
    throw new Error('MONGODB_URI environment variable is required');
  }

  console.log('[DB-3] Connecting to MongoDB Atlas...');
  console.log('[DB-URI]', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

  try {
    if (mongoose.connection.readyState !== 1) {
      mongoose.connection.on('error', (err) => {
        console.error('[DB-ERROR] MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('[DB-WARN] MongoDB disconnected');
        isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('[DB-INFO] MongoDB reconnected');
        isConnected = true;
      });

      mongoose.set('strictQuery', true);

      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
        retryWrites: true,
        w: 'majority',
      });

      isConnected = true;
      console.log('[DB-4] MongoDB connected successfully:', mongoose.connection.host);
    }
  } catch (error) {
    console.error('[DB-ERROR] MongoDB connection failed:', error.message);
    throw error;
  }
};

// Wrap Express app for Vercel
const handler = async (req, res) => {
  console.log('[REQUEST] Method:', req.method, 'URL:', req.url);

  try {
    await connectToDatabase();
    console.log('[HANDLER] Processing request...');

    await new Promise((resolve, reject) => {
      app(req, res, (err) => {
        if (err) {
          console.error('[MIDDLEWARE-ERROR]', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('[FATAL-ERROR]', error.message);
    console.error('[STACK]', error.stack);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message,
      });
    }
  }
};

module.exports = handler;
