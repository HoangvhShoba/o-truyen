const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

const connectDatabase = async () => {
  try {
    const { uri, options } = config.mongodb;

    const connection = await mongoose.connect(uri, options);

    logger.info(`MongoDB Connected: ${connection.connection.host}`);

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    mongoose.set('strictQuery', true);

    return connection;
  } catch (error) {
    logger.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error.message);
    throw error;
  }
};

module.exports = { connectDatabase, disconnectDatabase };
