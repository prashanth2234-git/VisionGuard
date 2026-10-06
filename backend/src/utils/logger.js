const sanitize = (data) => {
  if (!data || typeof data !== 'object') return data;
  const sanitized = { ...data };
  const sensitiveKeys = ['password', 'password_hash', 'token', 'authorization', 'secret', 'key'];
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  return sanitized;
};

const logger = {
  info: (message, meta = {}) => {
    const time = new Date().toISOString();
    console.log(`[${time}] [INFO] ${message}`, Object.keys(meta).length ? JSON.stringify(sanitize(meta)) : '');
  },
  warn: (message, meta = {}) => {
    const time = new Date().toISOString();
    console.warn(`[${time}] [WARN] ${message}`, Object.keys(meta).length ? JSON.stringify(sanitize(meta)) : '');
  },
  error: (message, meta = {}) => {
    const time = new Date().toISOString();
    console.error(`[${time}] [ERROR] ${message}`, Object.keys(meta).length ? JSON.stringify(sanitize(meta)) : '');
  },
};

module.exports = logger;
