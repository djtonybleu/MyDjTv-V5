import { PrismaClient } from '@prisma/client';
import env from './env.js';

// Initialize Prisma Client with optimized configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
  log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

// Connection pool configuration for raw PostgreSQL connections (if needed)
const connectionConfig = {
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // Connection pool optimization
  min: env.DB_POOL_MIN || 2,
  max: env.DB_POOL_MAX || 20,
  idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT || 30000,
  connectionTimeoutMillis: env.DB_POOL_CONNECTION_TIMEOUT || 5000,
  
  // Additional performance settings
  allowExitOnIdle: true,
  query_timeout: 10000, // 10 seconds
  statement_timeout: 10000, // 10 seconds
  
  // Connection validation
  application_name: 'mydjtv-api',
};

// Database connection and health check
export const connectDB = async () => {
  // Import logger dynamically to avoid circular dependency
  const { default: logger } = await import('./logger.js');
  
  try {
    // Test the Prisma connection
    await prisma.$connect();
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    
    logger.info('✅ PostgreSQL Connected via Prisma', {
      connection: 'Prisma ORM',
      database: 'PostgreSQL',
      environment: env.NODE_ENV
    });
    
    // Run any necessary migrations or setup
    await setupDatabase();
    logger.info('✅ Database setup completed');
    
    return prisma;
  } catch (error) {
    logger.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Setup database with optimizations
const setupDatabase = async () => {
  const { default: logger } = await import('./logger.js');
  
  try {
    // Enable query performance optimizations
    await prisma.$executeRaw`SET statement_timeout = '30s'`;
    await prisma.$executeRaw`SET lock_timeout = '10s'`;
    
    // Create any custom indexes if needed
    await createCustomIndexes();
    
    logger.info('✅ Database optimizations applied');
  } catch (error) {
    logger.warn('⚠️  Database setup warning:', error.message);
  }
};

// Create custom indexes for better performance
const createCustomIndexes = async () => {
  const { default: logger } = await import('./logger.js');
  
  const customIndexes = [
    // JSON field indexes for better query performance
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_venues_settings_gin ON venues USING gin(settings)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_playlists_tracks_gin ON playlists USING gin(tracks)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_analytics_data_gin ON user_analytics USING gin(data)',
    
    // Composite indexes for common query patterns
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_venues_owner_active ON venues(owner_id, is_active)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_playlists_venue_active ON playlists(venue_id, is_active)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_active_venue ON venue_sessions(venue_id, last_activity)',
    
    // Performance indexes for analytics
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_analytics_event_timestamp ON user_analytics(event, timestamp)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_metrics_type_timestamp ON system_metrics(metric_type, timestamp)',
    
    // Indexes for subscription and payment queries
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_subscription_stripe ON users(subscription_status, stripe_customer_id)',
  ];

  for (const indexQuery of customIndexes) {
    try {
      await prisma.$executeRawUnsafe(indexQuery);
      logger.debug(`Custom index created: ${indexQuery.split(' ')[5]}`);
    } catch (error) {
      // Index might already exist or other non-critical error
      if (!error.message.includes('already exists')) {
        logger.warn(`Failed to create custom index: ${error.message}`);
      }
    }
  }
  
  logger.info('✅ Custom database indexes verified/created');
};

// Health check function
export const healthCheck = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
};

// Graceful shutdown
export const disconnectDB = async () => {
  const { default: logger } = await import('./logger.js');
  
  try {
    await prisma.$disconnect();
    logger.info('✅ Database disconnected gracefully');
  } catch (error) {
    logger.error('❌ Error disconnecting database:', error);
  }
};

// Export Prisma client as default
export { prisma };
export default prisma;