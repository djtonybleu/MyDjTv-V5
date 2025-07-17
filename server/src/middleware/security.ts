import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth';

// Security headers middleware
export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://api.spotify.com", "wss:", "ws:"],
        mediaSrc: ["'self'", "https:", "blob:"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
  
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    optionsSuccessStatus: 200,
  }),
];

// General rate limiting
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { 
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: 15 * 60,
    });
  },
});

// Strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true,
  message: { 
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: 15 * 60
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: 15 * 60,
    });
  },
});

// API rate limiting for general API endpoints
export const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per minute
  message: { 
    success: false,
    message: 'API rate limit exceeded, please slow down.',
    retryAfter: 60
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'API rate limit exceeded, please slow down.',
      retryAfter: 60,
    });
  },
});

// Strict rate limiting for password reset
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: { 
    success: false,
    message: 'Too many password reset attempts, please try again later.',
    retryAfter: 60 * 60
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many password reset attempts, please try again later.',
      retryAfter: 60 * 60,
    });
  },
});

// Authentication middleware
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }

    const decoded = await AuthService.validateToken(token);
    if (!decoded) {
      res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
      });
      return;
    }

    (req as any).user = { id: decoded.userId };
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Token validation failed',
    });
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Get user from database to check role
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        res.status(403).json({
          success: false,
          message: 'User not found or inactive',
        });
        return;
      }

      if (!roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Authorization check failed',
      });
    }
  };
};

// Subscription status middleware
export const requireSubscription = (requiredLevel: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionStatus: true, isActive: true },
      });

      if (!user || !user.isActive) {
        res.status(403).json({
          success: false,
          message: 'User not found or inactive',
        });
        return;
      }

      if (!requiredLevel.includes(user.subscriptionStatus)) {
        res.status(403).json({
          success: false,
          message: 'Subscription upgrade required',
          requiredLevel,
          currentLevel: user.subscriptionStatus,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Subscription check failed',
      });
    }
  };
};

// Venue ownership middleware
export const requireVenueOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const venueId = req.params.venueId || req.body.venueId;

    if (!userId || !venueId) {
      res.status(400).json({
        success: false,
        message: 'User ID and Venue ID required',
      });
      return;
    }

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const venue = await prisma.venue.findUnique({
      where: { id: parseInt(venueId) },
      select: { ownerId: true },
    });

    if (!venue) {
      res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
      return;
    }

    if (venue.ownerId !== userId) {
      res.status(403).json({
        success: false,
        message: 'You do not own this venue',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Venue ownership check failed',
    });
  }
};

// Input validation middleware
export const validateInput = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
      return;
    }
    next();
  };
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id || 'anonymous',
    };

    // Only log errors and slow requests in production
    if (process.env.NODE_ENV === 'production') {
      if (res.statusCode >= 400 || duration > 1000) {
        console.error('[REQUEST]', logData);
      }
    } else {
      console.log('[REQUEST]', logData);
    }
  });

  next();
};