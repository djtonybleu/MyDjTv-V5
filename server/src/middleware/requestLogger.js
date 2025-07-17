import morgan from 'morgan';
import logger from '../config/logger.js';
import env from '../config/env.js';

morgan.token('user-id', (req) => {
  return req.user?.id || 'anonymous';
});

morgan.token('real-ip', (req) => {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress;
});

const isDevelopment = env.NODE_ENV === 'development';

const morganFormat = isDevelopment
  ? ':method :url :status :res[content-length] - :response-time ms'
  : ':real-ip - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

const requestLogger = morgan(morganFormat, {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    }
  },
  skip: (req, res) => {
    // Skip logging health checks and static assets
    return req.url === '/api/health' || 
           req.url.startsWith('/static/') ||
           (env.NODE_ENV === 'test');
  }
});

export default requestLogger;