const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config');

const logDir = path.dirname(config.log.file);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), logFormat),
  }),
  new winston.transports.File({
    filename: config.log.file,
    format: logFormat,
    maxsize: 5242880,
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 5242880,
    maxFiles: 5,
  }),
];

const logger = winston.createLogger({
  level: config.log.level,
  transports,
  exitOnError: false,
});

module.exports = logger;
