import pool from '../config/database.js';

export const Commercial = {
  async create(commercialData) {
    const { title, venue_id, audio_url, thumbnail, duration } = commercialData;
    
    const result = await pool.query(`
      INSERT INTO commercials (title, venue_id, audio_url, thumbnail, duration) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [title, venue_id, audio_url, thumbnail, duration]);
    
    return result.rows[0];
  },

  async findByVenueId(venueId) {
    const result = await pool.query('SELECT * FROM commercials WHERE venue_id = $1 AND active = true', [venueId]);
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM commercials WHERE id = $1', [id]);
    return result.rows[0];
  },

  async update(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const result = await pool.query(
      `UPDATE commercials SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM commercials WHERE id = $1', [id]);
  },

  async incrementPlays(id) {
    await pool.query('UPDATE commercials SET plays = plays + 1 WHERE id = $1', [id]);
  }
};

export default Commercial;