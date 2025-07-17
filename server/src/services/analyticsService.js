import prisma from '../config/prisma.js';
import cron from 'node-cron';

export const trackPlay = async (venueId, trackId, userId = null) => {
  try {
    // Update venue analytics
    await prisma.venue.update({
      where: { id: venueId },
      data: { totalPlays: { increment: 1 } }
    });

    // Update track plays
    await prisma.track.update({
      where: { id: trackId },
      data: { plays: { increment: 1 } }
    });

    // Log play event
    await prisma.$executeRaw`
      INSERT INTO play_logs (venue_id, track_id, user_id, created_at) 
      VALUES (${venueId}, ${trackId}, ${userId}, NOW())
    `;

    console.log(`Play tracked: Venue ${venueId}, Track ${trackId}`);
  } catch (error) {
    console.error('Error tracking play:', error);
  }
};

export const trackCommercialView = async (venueId, commercialId) => {
  try {
    await prisma.commercial.update({
      where: { id: commercialId },
      data: { plays: { increment: 1 } }
    });

    console.log(`Commercial view tracked: ${commercialId}`);
  } catch (error) {
    console.error('Error tracking commercial view:', error);
  }
};

export const getVenueAnalytics = async (venueId, days = 30) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as plays,
        COUNT(DISTINCT user_id) as unique_users
      FROM play_logs 
      WHERE venue_id = ${venueId} 
        AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    `;

    return result;
  } catch (error) {
    console.error('Error getting analytics:', error);
    return [];
  }
};

// Daily analytics aggregation
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily analytics aggregation...');
  
  try {
    // Get all venues
    const venues = await prisma.venue.findMany();
    
    // Update unique users count for each venue
    for (const venue of venues) {
      const uniqueUsers = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT user_id) as count
        FROM play_logs 
        WHERE venue_id = ${venue.id} 
          AND created_at >= NOW() - INTERVAL '30 days'
      `;
      
      await prisma.venue.update({
        where: { id: venue.id },
        data: { uniqueUsers: uniqueUsers[0].count }
      });
    }

    console.log('Daily analytics aggregation completed');
  } catch (error) {
    console.error('Error in daily analytics:', error);
  }
});

// Create play_logs table if it doesn't exist
export const initializeAnalytics = async () => {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS play_logs (
        id SERIAL PRIMARY KEY,
        venue_id INTEGER REFERENCES venues(id),
        track_id INTEGER REFERENCES tracks(id),
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Analytics tables initialized');
  } catch (error) {
    console.error('Error initializing analytics:', error);
  }
};