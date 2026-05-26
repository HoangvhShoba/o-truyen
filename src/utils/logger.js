const createLogger = (level) => {
  const levels = { error: 0, warn: 1, info: 2, debug: 3 };

  return {
    error: (...args) => levels[level] >= 0 && console.error(...args),
    warn: (...args) => levels[level] >= 1 && console.warn(...args),
    info: (...args) => levels[level] >= 2 && console.info(...args),
    debug: (...args) => levels[level] >= 3 && console.debug(...args),
  };
};

const logger = createLogger(process.env.LOG_LEVEL || 'info');

module.exports = logger;
