import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Custom error class for application-specific errors
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
    this.name = 'InternalServerError';
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: any;
  stack?: string;
  timestamp: string;
  path: string;
  method: string;
}

// Main error handler middleware
export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_SERVER_ERROR';
  let details: any = undefined;

  // Handle different error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || 'APPLICATION_ERROR';
  } else if (err instanceof PrismaClientKnownRequestError) {
    statusCode = 400;
    code = 'DATABASE_ERROR';
    
    switch (err.code) {
      case 'P2002':
        message = 'Duplicate entry found';
        const target = err.meta?.target as string[];
        if (target) {
          details = { field: target[0], message: `${target[0]} already exists` };
        }
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        break;
      case 'P2003':
        message = 'Foreign key constraint failed';
        break;
      case 'P2014':
        message = 'Invalid ID provided';
        break;
      case 'P2021':
        message = 'Table does not exist';
        break;
      case 'P2022':
        message = 'Column does not exist';
        break;
      default:
        message = 'Database operation failed';
    }
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  } else if (err.name === 'SyntaxError') {
    statusCode = 400;
    message = 'Invalid JSON format';
    code = 'INVALID_JSON';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload error';
    code = 'FILE_UPLOAD_ERROR';
    
    if ((err as any).code === 'LIMIT_FILE_SIZE') {
      message = 'File too large';
    } else if ((err as any).code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    }
  }

  // Log error details
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    status: statusCode,
    error: message,
    code,
    stack: err.stack,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id || 'anonymous',
    body: req.body,
    params: req.params,
    query: req.query,
  };

  // Log based on severity
  if (statusCode >= 500) {
    console.error('[FATAL ERROR]', logData);
  } else if (statusCode >= 400) {
    console.warn('[CLIENT ERROR]', logData);
  } else {
    console.info('[INFO]', logData);
  }

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  // Add details if available
  if (details) {
    errorResponse.details = details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Send response
  res.status(statusCode).json(errorResponse);
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  });
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Process error handlers
export const handleUncaughtException = (error: Error): void => {
  console.error('[UNCAUGHT EXCEPTION]', {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack,
  });
  
  // Graceful shutdown
  process.exit(1);
};

export const handleUnhandledRejection = (reason: any, promise: Promise<any>): void => {
  console.error('[UNHANDLED REJECTION]', {
    timestamp: new Date().toISOString(),
    reason,
    promise,
  });
  
  // Graceful shutdown
  process.exit(1);
};

// Graceful shutdown handler
export const handleGracefulShutdown = (signal: string): void => {
  console.log(`[${signal}] Received, shutting down gracefully...`);
  
  // Close database connections, stop servers, etc.
  // This is where you'd clean up resources
  
  setTimeout(() => {
    console.log('[SHUTDOWN] Forcefully shutting down...');
    process.exit(1);
  }, 10000); // 10 second timeout
  
  process.exit(0);
};

// Response helpers
export const sendSuccess = (
  res: Response,
  data: any = null,
  message: string = 'Success',
  statusCode: number = 200
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): void => {
  const response: any = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (code) response.code = code;
  if (details) response.details = details;

  res.status(statusCode).json(response);
};

export const sendPaginatedResponse = (
  res: Response,
  data: any[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Success'
): void => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};