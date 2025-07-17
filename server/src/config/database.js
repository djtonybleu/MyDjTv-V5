import pkg from 'pg';
import env from './env.js';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // Connection pool optimization
  min: env.DB_POOL_MIN,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT,
  connectionTimeoutMillis: env.DB_POOL_CONNECTION_TIMEOUT,
  
  // Additional performance settings
  allowExitOnIdle: true,
  query_timeout: 10000, // 10 seconds
  statement_timeout: 10000, // 10 seconds
  
  // Connection validation
  application_name: 'mydjtv-api',
});

// Pool event handlers for monitoring
pool.on('connect', (client) => {
  // Don't log every connection in production to avoid spam
  if (env.NODE_ENV === 'development') {
    import('./logger.js').then(({ default: logger }) => {
      logger.debug('New database client connected');
    });
  }
});

pool.on('error', (err, client) => {
  import('./logger.js').then(({ default: logger }) => {
    logger.error('Database pool error:', err);
  });
});

export const connectDB = async () => {
  // Import logger dynamically to avoid circular dependency
  const { default: logger } = await import('./logger.js');
  
  try {
    // Test the connection
    const client = await pool.connect();
    client.release();
    
    logger.info('✅ PostgreSQL Connected', {
      poolMin: env.DB_POOL_MIN,
      poolMax: env.DB_POOL_MAX,
      idleTimeout: env.DB_POOL_IDLE_TIMEOUT,
      connectionTimeout: env.DB_POOL_CONNECTION_TIMEOUT
    });
    
    await createTables();
    logger.info('✅ Database tables verified/created');
  } catch (error) {
    logger.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

const createTables = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      subscription_status VARCHAR(50) DEFAULT 'inactive',
      subscription_plan VARCHAR(50) DEFAULT 'free',
      stripe_customer_id VARCHAR(255),
      subscription_id VARCHAR(255),
      expires_at TIMESTAMP,
      venue_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS venues (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      location VARCHAR(255) NOT NULL,
      owner_id INTEGER REFERENCES users(id),
      logo TEXT,
      primary_color VARCHAR(7) DEFAULT '#0EA5E9',
      secondary_color VARCHAR(7) DEFAULT '#06B6D4',
      max_users INTEGER DEFAULT 50,
      commercial_frequency INTEGER DEFAULT 3,
      qr_code TEXT,
      total_plays INTEGER DEFAULT 0,
      unique_users INTEGER DEFAULT 0,
      revenue DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS tracks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      artist VARCHAR(255) NOT NULL,
      album VARCHAR(255),
      duration INTEGER NOT NULL,
      thumbnail TEXT,
      spotify_id VARCHAR(255),
      plays INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS commercials (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      venue_id INTEGER REFERENCES venues(id),
      audio_url TEXT NOT NULL,
      thumbnail TEXT,
      duration INTEGER NOT NULL,
      active BOOLEAN DEFAULT true,
      plays INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS playlists (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      venue_id INTEGER REFERENCES venues(id),
      is_active BOOLEAN DEFAULT false,
      genre VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];
  
  for (const query of queries) {
    await pool.query(query);
  }
  
  // Create performance indexes
  await createIndexes();
};

const createIndexes = async () => {
  const { default: logger } = await import('./logger.js');
  
  const indexes = [
    // Users table indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_subscription_status ON users(subscription_status)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_venue_id ON users(venue_id)',
    
    // Venues table indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_venues_owner_id ON venues(owner_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_venues_type ON venues(type)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_venues_created_at ON venues(created_at)',
    
    // Tracks table indexes  
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracks_spotify_id ON tracks(spotify_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracks_artist ON tracks(artist)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracks_plays ON tracks(plays DESC)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracks_title_artist ON tracks(title, artist)',
    
    // Commercials table indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commercials_venue_id ON commercials(venue_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commercials_active ON commercials(active)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commercials_venue_active ON commercials(venue_id, active)',
    
    // Playlists table indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_playlists_venue_id ON playlists(venue_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_playlists_active ON playlists(is_active)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_playlists_genre ON playlists(genre)',
    
    // Composite indexes for common queries
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_role ON users(email, role)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_venues_owner_type ON venues(owner_id, type)'
  ];

  for (const indexQuery of indexes) {
    try {
      await pool.query(indexQuery);
      logger.debug(`Index created: ${indexQuery.split(' ')[5]}`);
    } catch (error) {
      // Index might already exist or other non-critical error
      if (!error.message.includes('already exists')) {
        logger.warn(`Failed to create index: ${error.message}`);
      }
    }
  }
  
  logger.info('✅ Database indexes verified/created');
};

export { pool };
export default pool;