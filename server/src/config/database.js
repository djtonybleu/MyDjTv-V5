import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const connectDB = async () => {
  try {
    await pool.connect();
    console.log('PostgreSQL Connected');
    await createTables();
  } catch (error) {
    console.error('Database connection error:', error);
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
};

export { pool };
export default pool;