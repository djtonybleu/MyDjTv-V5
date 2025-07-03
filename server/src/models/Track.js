import pool from '../config/database.js';

export const Track = {
  async create(trackData) {
    const { title, artist, album, duration, thumbnail, spotify_id } = trackData;
    
    const result = await pool.query(`
      INSERT INTO tracks (title, artist, album, duration, thumbnail, spotify_id) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [title, artist, album, duration, thumbnail, spotify_id]);
    
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM tracks WHERE id = $1', [id]);
    return result.rows[0];
  },

  async search(query, limit = 20) {
    const result = await pool.query(`
      SELECT * FROM tracks 
      WHERE title ILIKE $1 OR artist ILIKE $1 
      LIMIT $2
    `, [`%${query}%`, limit]);
    return result.rows;
  },

  async incrementPlays(id) {
    await pool.query('UPDATE tracks SET plays = plays + 1 WHERE id = $1', [id]);
  }
};

export default Track;