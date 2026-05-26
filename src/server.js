const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const { connectDatabase, disconnectDatabase } = require('./config/database');

const startServer = async () => {
  try {
    await connectDatabase();
    logger.info('Database connected successfully');

    const server = app.listen(config.port, () => {
      logger.info(`Server running in ${config.env} mode on port ${config.port}`);
      logger.info(`API Documentation: ${config.baseUrl}${config.swagger.url}`);
    });

    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await disconnectDatabase();
          logger.info('Database disconnected');
        } catch (error) {
          logger.error('Error disconnecting database:', error);
        }

        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('exit', (code) => {
      logger.info(`Process exiting with code: ${code}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
