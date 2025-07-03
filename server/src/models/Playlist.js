import pool from '../config/database.js';

export const Playlist = {
  async create(playlistData) {
    const { name, venue_id, genre } = playlistData;
    
    const result = await pool.query(`
      INSERT INTO playlists (name, venue_id, genre) 
      VALUES ($1, $2, $3) RETURNING *
    `, [name, venue_id, genre]);
    
    return result.rows[0];
  },

  async findByVenueId(venueId) {
    const result = await pool.query('SELECT * FROM playlists WHERE venue_id = $1', [venueId]);
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM playlists WHERE id = $1', [id]);
    return result.rows[0];
  },

  async update(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const result = await pool.query(
      `UPDATE playlists SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  }
};

export default Playlist;