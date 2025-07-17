const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/mydjtv',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Función para crear las tablas
async function createTables() {
  const queries = [
    // Tabla Users
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      is_premium BOOLEAN DEFAULT false,
      stripe_customer_id VARCHAR(255),
      subscription_id VARCHAR(255),
      subscription_status VARCHAR(50) DEFAULT 'inactive',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tabla Venues
    `CREATE TABLE IF NOT EXISTS venues (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      address TEXT,
      phone VARCHAR(50),
      email VARCHAR(255),
      business_type VARCHAR(100),
      qr_code TEXT,
      branding_color VARCHAR(7) DEFAULT '#6366f1',
      logo_url TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tabla Tracks
    `CREATE TABLE IF NOT EXISTS tracks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      artist VARCHAR(255) NOT NULL,
      album VARCHAR(255),
      duration INTEGER DEFAULT 0,
      spotify_id VARCHAR(255),
      preview_url TEXT,
      image_url TEXT,
      genre VARCHAR(100),
      is_explicit BOOLEAN DEFAULT false,
      popularity INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tabla Playlists
    `CREATE TABLE IF NOT EXISTS playlists (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      is_public BOOLEAN DEFAULT false,
      image_url TEXT,
      total_tracks INTEGER DEFAULT 0,
      total_duration INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tabla Playlist_Tracks (relación muchos a muchos)
    `CREATE TABLE IF NOT EXISTS playlist_tracks (
      id SERIAL PRIMARY KEY,
      playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
      track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
      position INTEGER DEFAULT 0,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(playlist_id, track_id)
    )`,

    // Tabla Commercials
    `CREATE TABLE IF NOT EXISTS commercials (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
      file_url TEXT NOT NULL,
      file_type VARCHAR(50) DEFAULT 'audio/mpeg',
      duration INTEGER DEFAULT 0,
      file_size INTEGER DEFAULT 0,
      play_count INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tabla Analytics
    `CREATE TABLE IF NOT EXISTS analytics (
      id SERIAL PRIMARY KEY,
      venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      event_type VARCHAR(100) NOT NULL,
      event_data JSONB,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tabla Sessions (para WebSockets)
    `CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      socket_id VARCHAR(255),
      is_active BOOLEAN DEFAULT true,
      last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Índices para optimización
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
    `CREATE INDEX IF NOT EXISTS idx_venues_owner ON venues(owner_id)`,
    `CREATE INDEX IF NOT EXISTS idx_tracks_spotify ON tracks(spotify_id)`,
    `CREATE INDEX IF NOT EXISTS idx_playlists_venue ON playlists(venue_id)`,
    `CREATE INDEX IF NOT EXISTS idx_commercials_venue ON commercials(venue_id)`,
    `CREATE INDEX IF NOT EXISTS idx_analytics_venue ON analytics(venue_id)`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_venue ON sessions(venue_id)`
  ];

  for (const query of queries) {
    try {
      await pool.query(query);
      console.log('✅ Tabla creada correctamente');
    } catch (error) {
      console.error('❌ Error creando tabla:', error.message);
    }
  }
}

// Función para insertar datos de prueba
async function insertSeedData() {
  try {
    // Limpiar datos existentes
    await pool.query('TRUNCATE TABLE analytics, sessions, playlist_tracks, commercials, playlists, tracks, venues, users RESTART IDENTITY CASCADE');

    // Hashear contraseñas
    const adminPassword = await bcrypt.hash('MyDJTV2024!', 10);
    const venuePassword = await bcrypt.hash('Venue2024!', 10);
    const userPassword = await bcrypt.hash('User2024!', 10);

    // Insertar usuarios
    const usersQuery = `
      INSERT INTO users (email, password, name, role, is_premium, subscription_status) VALUES
      ('admin@mydjtv.com', $1, 'Admin MyDJTV', 'admin', true, 'active'),
      ('venue@mydjtv.com', $2, 'Venue Manager', 'venue', false, 'inactive'),
      ('user@mydjtv.com', $3, 'Premium User', 'user', true, 'active'),
      ('demo@mydjtv.com', $4, 'Demo User', 'user', false, 'inactive')
      RETURNING id, email, role
    `;

    const userResults = await pool.query(usersQuery, [adminPassword, venuePassword, userPassword, userPassword]);
    console.log('✅ Usuarios creados:', userResults.rows);

    // Obtener IDs de usuarios
    const venueOwnerId = userResults.rows.find(user => user.role === 'venue').id;
    const userId = userResults.rows.find(user => user.email === 'user@mydjtv.com').id;

    // Insertar venues
    const venuesQuery = `
      INSERT INTO venues (name, description, owner_id, address, phone, email, business_type, qr_code, branding_color) VALUES
      ('Demo Restaurant', 'Restaurante de prueba para MyDJTV', $1, 'Av. Chapultepec 123, Guadalajara', '+52 33 1234 5678', 'demo@restaurant.com', 'restaurant', 'DEMO_QR_CODE', '#e11d48'),
      ('Fitness Gym Demo', 'Gimnasio moderno con música interactiva', $1, 'Calle Juárez 456, Zapopan', '+52 33 8765 4321', 'info@fitnessgym.com', 'gym', 'GYM_QR_CODE', '#059669'),
      ('Hotel Boutique', 'Hotel boutique con experiencia musical', $1, 'Av. Vallarta 789, Guadalajara', '+52 33 5555 0000', 'reservas@hotelboutique.com', 'hotel', 'HOTEL_QR_CODE', '#7c3aed')
      RETURNING id, name
    `;

    const venueResults = await pool.query(venuesQuery, [venueOwnerId]);
    console.log('✅ Venues creados:', venueResults.rows);

    // Insertar tracks de demo
    const tracksQuery = `
      INSERT INTO tracks (title, artist, album, duration, spotify_id, preview_url, image_url, genre, popularity) VALUES
      ('Despacito', 'Luis Fonsi ft. Daddy Yankee', 'Vida', 228, 'demo_001', 'https://demo.com/preview1.mp3', 'https://demo.com/cover1.jpg', 'Reggaeton', 95),
      ('Shape of You', 'Ed Sheeran', '÷ (Divide)', 233, 'demo_002', 'https://demo.com/preview2.mp3', 'https://demo.com/cover2.jpg', 'Pop', 92),
      ('Blinding Lights', 'The Weeknd', 'After Hours', 200, 'demo_003', 'https://demo.com/preview3.mp3', 'https://demo.com/cover3.jpg', 'Synthwave', 88),
      ('Dance Monkey', 'Tones and I', 'The Kids Are Coming', 209, 'demo_004', 'https://demo.com/preview4.mp3', 'https://demo.com/cover4.jpg', 'Pop', 85),
      ('Someone You Loved', 'Lewis Capaldi', 'Divinely Uninspired', 182, 'demo_005', 'https://demo.com/preview5.mp3', 'https://demo.com/cover5.jpg', 'Ballad', 80)
      RETURNING id, title, artist
    `;

    const trackResults = await pool.query(tracksQuery);
    console.log('✅ Tracks creados:', trackResults.rows);

    // Crear playlists
    const playlistsQuery = `
      INSERT INTO playlists (name, description, venue_id, user_id, is_public, total_tracks) VALUES
      ('Ambiente Restaurante', 'Música perfecta para cenas románticas', $1, $2, true, 3),
      ('Energía Gym', 'Música motivacional para entrenar', $3, $2, true, 2),
      ('Relajación Hotel', 'Música suave para el lobby', $4, $2, true, 2)
      RETURNING id, name
    `;

    const playlistResults = await pool.query(playlistsQuery, [
      venueResults.rows[0].id,
      userId,
      venueResults.rows[1].id,
      venueResults.rows[2].id
    ]);
    console.log('✅ Playlists creadas:', playlistResults.rows);

    // Agregar tracks a playlists
    const playlistTracksQuery = `
      INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES
      ($1, $2, 1), ($1, $3, 2), ($1, $4, 3),
      ($5, $6, 1), ($5, $7, 2),
      ($8, $9, 1), ($8, $10, 2)
    `;

    await pool.query(playlistTracksQuery, [
      playlistResults.rows[0].id, trackResults.rows[0].id, trackResults.rows[1].id, trackResults.rows[4].id,
      playlistResults.rows[1].id, trackResults.rows[2].id, trackResults.rows[3].id,
      playlistResults.rows[2].id, trackResults.rows[1].id, trackResults.rows[4].id
    ]);

    // Insertar comerciales demo
    const commercialsQuery = `
      INSERT INTO commercials (title, description, venue_id, file_url, duration, file_size, is_active) VALUES
      ('Promoción Especial', 'Descuento 20% en platillos principales', $1, 'https://demo.com/commercial1.mp3', 30, 480000, true),
      ('Nueva Rutina', 'Conoce nuestras nuevas clases de yoga', $2, 'https://demo.com/commercial2.mp3', 25, 400000, true),
      ('Suite Premium', 'Disfruta de nuestras suites con vista', $3, 'https://demo.com/commercial3.mp3', 35, 560000, true)
      RETURNING id, title
    `;

    await pool.query(commercialsQuery, [
      venueResults.rows[0].id,
      venueResults.rows[1].id,
      venueResults.rows[2].id
    ]);

    // Insertar analytics demo
    const analyticsQuery = `
      INSERT INTO analytics (venue_id, user_id, event_type, event_data) VALUES
      ($1, $2, 'song_play', '{"track_id": 1, "duration": 180}'),
      ($1, $2, 'commercial_play', '{"commercial_id": 1, "completed": true}'),
      ($3, $2, 'song_skip', '{"track_id": 2, "skip_time": 45}'),
      ($4, $2, 'playlist_create', '{"playlist_id": 1, "tracks_count": 3}')
    `;

    await pool.query(analyticsQuery, [
      venueResults.rows[0].id, userId,
      venueResults.rows[1].id,
      venueResults.rows[2].id
    ]);

    console.log('✅ Datos de prueba insertados correctamente');
    console.log('\n🎉 SEEDER COMPLETADO EXITOSAMENTE');
    console.log('\n📋 Cuentas creadas:');
    console.log('👑 Admin: admin@mydjtv.com / MyDJTV2024!');
    console.log('🏢 Venue: venue@mydjtv.com / Venue2024!');
    console.log('👤 User: user@mydjtv.com / User2024!');
    console.log('🔧 Demo: demo@mydjtv.com / User2024!');

  } catch (error) {
    console.error('❌ Error en seeder:', error);
    throw error;
  }
}

// Función principal
async function runSeeder() {
  try {
    console.log('🚀 Iniciando seeder de PostgreSQL...');
    
    // Verificar conexión
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL establecida');

    // Crear tablas
    console.log('📋 Creando tablas...');
    await createTables();

    // Insertar datos
    console.log('📝 Insertando datos de prueba...');
    await insertSeedData();

    console.log('✅ Seeder completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en seeder:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('👋 Conexión cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runSeeder();
}

module.exports = { runSeeder, createTables, insertSeedData };