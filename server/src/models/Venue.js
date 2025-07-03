import pool from '../config/database.js';
import QRCode from 'qrcode';

export const Venue = {
  async create(venueData) {
    const { name, type, location, owner_id, logo, primary_color, secondary_color } = venueData;
    
    const result = await pool.query(`
      INSERT INTO venues (name, type, location, owner_id, logo, primary_color, secondary_color) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [name, type, location, owner_id, logo, primary_color, secondary_color]);
    
    const venue = result.rows[0];
    
    // Generate QR code
    const qrCodeUrl = `${process.env.CLIENT_URL}/remote?venue=${venue.id}`;
    const qrCode = await QRCode.toDataURL(qrCodeUrl);
    
    await pool.query('UPDATE venues SET qr_code = $1 WHERE id = $2', [qrCode, venue.id]);
    venue.qr_code = qrCode;
    
    return venue;
  },

  async findByOwnerId(ownerId) {
    const result = await pool.query('SELECT * FROM venues WHERE owner_id = $1', [ownerId]);
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM venues WHERE id = $1', [id]);
    return result.rows[0];
  },

  async update(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const result = await pool.query(
      `UPDATE venues SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },

  async updateAnalytics(id, analytics) {
    const { totalPlays, uniqueUsers, revenue } = analytics;
    await pool.query(`
      UPDATE venues 
      SET total_plays = $1, unique_users = $2, revenue = $3 
      WHERE id = $4
    `, [totalPlays, uniqueUsers, revenue, id]);
  }
};

export default Venue;