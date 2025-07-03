import pool from '../config/database.js';
import cron from 'node-cron';

export const trackPlay = async (venueId, trackId, userId = null) => {
  try {
    // Update venue analytics
    await pool.query(`
      UPDATE venues 
      SET total_plays = total_plays + 1 
      WHERE id = $1
    `, [venueId]);

    // Update track plays
    await pool.query(`
      UPDATE tracks 
      SET plays = plays + 1 
      WHERE id = $1
    `, [trackId]);

    // Log play event
    await pool.query(`
      INSERT INTO play_logs (venue_id, track_id, user_id, played_at) 
      VALUES ($1, $2, $3, NOW())
    `, [venueId, trackId, userId]);

    console.log(`Play tracked: Venue ${venueId}, Track ${trackId}`);
  } catch (error) {
    console.error('Error tracking play:', error);
  }
};

export const trackCommercialView = async (venueId, commercialId) => {
  try {
    await pool.query(`
      UPDATE commercials 
      SET plays = plays + 1 
      WHERE id = $1
    `, [commercialId]);

    console.log(`Commercial view tracked: ${commercialId}`);
  } catch (error) {
    console.error('Error tracking commercial view:', error);
  }
};

export const getVenueAnalytics = async (venueId, days = 30) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE(played_at) as date,
        COUNT(*) as plays,
        COUNT(DISTINCT user_id) as unique_users
      FROM play_logs 
      WHERE venue_id = $1 
        AND played_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(played_at)
      ORDER BY date DESC
    `, [venueId]);

    return result.rows;
  } catch (error) {
    console.error('Error getting analytics:', error);
    return [];
  }
};

// Daily analytics aggregation
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily analytics aggregation...');
  
  try {
    // Update unique users count for each venue
    await pool.query(`
      UPDATE venues 
      SET unique_users = (
        SELECT COUNT(DISTINCT user_id) 
        FROM play_logs 
        WHERE venue_id = venues.id 
          AND played_at >= NOW() - INTERVAL '30 days'
      )
    `);

    console.log('Daily analytics aggregation completed');
  } catch (error) {
    console.error('Error in daily analytics:', error);
  }
});

// Create play_logs table if it doesn't exist
export const initializeAnalytics = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS play_logs (
        id SERIAL PRIMARY KEY,
        venue_id INTEGER REFERENCES venues(id),
        track_id INTEGER,
        user_id INTEGER REFERENCES users(id),
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Analytics tables initialized');
  } catch (error) {
    console.error('Error initializing analytics:', error);
  }
};