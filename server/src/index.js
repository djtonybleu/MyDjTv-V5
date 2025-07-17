import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const prisma = new PrismaClient();

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', (req, res, next) => {
  // Basic auth routes for now
  if (req.method === 'POST' && req.path === '/login') {
    return res.json({
      success: true,
      message: 'Login endpoint working',
      data: {
        user: { id: 1, email: 'demo@mydjtv.com', role: 'USER' },
        token: 'demo-token'
      }
    });
  }
  
  if (req.method === 'POST' && req.path === '/register') {
    return res.json({
      success: true,
      message: 'Registration endpoint working',
      data: {
        user: { id: 1, email: req.body.email, role: 'USER' },
        token: 'demo-token'
      }
    });
  }
  
  res.json({ success: true, message: 'Auth endpoints working' });
});

app.use('/api/venues', (req, res) => {
  res.json({
    success: true,
    message: 'Venues endpoint working',
    data: []
  });
});

app.use('/api/music', (req, res) => {
  res.json({
    success: true,
    message: 'Music endpoint working',
    data: []
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join-venue', (data) => {
    const { venueId } = data;
    socket.join(`venue:${venueId}`);
    console.log(`Client ${socket.id} joined venue: ${venueId}`);
    
    // Send venue data
    socket.emit('venue-data', {
      venueId,
      connectedUsers: io.sockets.adapter.rooms.get(`venue:${venueId}`)?.size || 0,
      currentTrack: null,
      isPlaying: false,
      volume: 50
    });
  });

  socket.on('music-control', (data) => {
    const { venueId, action, trackId, position, volume } = data;
    
    // Broadcast to venue room
    socket.to(`venue:${venueId}`).emit('music-update', {
      action,
      trackId,
      position,
      volume,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});