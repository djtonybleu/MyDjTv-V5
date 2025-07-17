import winston from 'winston';
import env from './env.js';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const createLogger = () => {
  const isProduction = env.NODE_ENV === 'production';
  
  const formats = [
    errors({ stack: true }),
    timestamp()
  ];

  if (isProduction) {
    formats.push(json());
  } else {
    formats.push(colorize(), simple());
  }

  return winston.createLogger({
    level: isProduction ? 'info' : 'debug',
    format: combine(...formats),
    defaultMeta: { service: 'mydjtv-api' },
    transports: [
      new winston.transports.Console({
        silent: env.NODE_ENV === 'test'
      }),
      ...(isProduction ? [
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        new winston.transports.File({ 
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ] : [])
    ],
    exceptionHandlers: [
      new winston.transports.Console(),
      ...(isProduction ? [
        new winston.transports.File({ filename: 'logs/exceptions.log' })
      ] : [])
    ],
    rejectionHandlers: [
      new winston.transports.Console(),
      ...(isProduction ? [
        new winston.transports.File({ filename: 'logs/rejections.log' })
      ] : [])
    ]
  });
};

const logger = createLogger();

export default logger;