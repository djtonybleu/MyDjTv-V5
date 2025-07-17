import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';

import env from './config/env.js';
import logger from './config/logger.js';
import requestLogger from './middleware/requestLogger.js';
import { generalRateLimit, progressiveSlowDown } from './middleware/rateLimiting.js';
import cache from './config/cache.js';
import { connectDB } from './config/database.js';
import { initializeAnalytics } from './services/analyticsService.js';
import { getQueueStats, closeQueues } from './services/queueService.js';
import authRoutes from './routes/auth.js';
import venueRoutes from './routes/venues.js';
import musicRoutes from './routes/music.js';
import paymentRoutes from './routes/payments.js';
import commercialRoutes from './routes/commercials.js';
import demoRoutes from './routes/demo.js';


const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

// Logging middleware (before other middleware)
app.use(requestLogger);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true
}));

// Rate limiting (progressive)
app.use(generalRateLimit);
app.use(progressiveSlowDown);

// Body parsing middleware
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to database and cache
connectDB();
cache.connect();
initializeAnalytics();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/commercials', commercialRoutes);
app.use('/api/demo', demoRoutes);

// Health check with queue status
app.get('/api/health', async (req, res) => {
  const queueStats = await getQueueStats();
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    cache: cache.isConnected ? 'connected' : 'disconnected',
    queues: queueStats
  });
});

// Socket.IO for real-time features
const venueRooms = new Map();

io.on('connection', (socket) => {
  logger.info('User connected', { socketId: socket.id });

  socket.on('join-venue', (venueId) => {
    socket.join(venueId);
    
    if (!venueRooms.has(venueId)) {
      venueRooms.set(venueId, new Set());
    }
    venueRooms.get(venueId).add(socket.id);
    
    // Broadcast user count
    io.to(venueId).emit('user-count', venueRooms.get(venueId).size);
  });

  socket.on('play-track', (data) => {
    socket.to(data.venueId).emit('track-changed', data);
  });

  socket.on('volume-change', (data) => {
    socket.to(data.venueId).emit('volume-updated', data);
  });

  socket.on('commercial-start', (data) => {
    io.to(data.venueId).emit('commercial-playing', data);
  });

  socket.on('disconnect', () => {
    logger.info('User disconnected', { socketId: socket.id });
    
    // Remove from all venue rooms
    for (const [venueId, users] of venueRooms.entries()) {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        io.to(venueId).emit('user-count', users.size);
        
        if (users.size === 0) {
          venueRooms.delete(venueId);
        }
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  const statusCode = err.statusCode || 500;
  const message = env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
    
  res.status(statusCode).json({ 
    message,
    ...(env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, starting graceful shutdown...');
  await closeQueues();
  await cache.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, starting graceful shutdown...');
  await closeQueues();
  await cache.disconnect();
  process.exit(0);
});

server.listen(env.PORT, () => {
  logger.info('✅ Environment variables validated successfully');
  logger.info('🚀 Server started', {
    port: env.PORT,
    environment: env.NODE_ENV,
    nodeVersion: process.version,
    cacheConnected: cache.isConnected
  });
});