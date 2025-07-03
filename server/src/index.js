import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import venueRoutes from './routes/venues.js';
import musicRoutes from './routes/music.js';
import paymentRoutes from './routes/payments.js';
import commercialRoutes from './routes/commercials.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/commercials', commercialRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO for real-time features
const venueRooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

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
    console.log('User disconnected:', socket.id);
    
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
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});