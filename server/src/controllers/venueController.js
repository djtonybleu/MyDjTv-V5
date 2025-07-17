import prisma from '../config/prisma.js';
import QRCode from 'qrcode';

export const createVenue = async (req, res) => {
  try {
    const { name, type, location, branding } = req.body;
    
    const venue = await prisma.venue.create({
      data: {
        name,
        type,
        location,
        ownerId: req.user.id,
        logo: branding?.logo,
        primaryColor: branding?.primaryColor,
        secondaryColor: branding?.secondaryColor
      }
    });

    // Generate QR code
    const qrCodeUrl = `${process.env.CLIENT_URL}/remote?venue=${venue.id}`;
    const qrCode = await QRCode.toDataURL(qrCodeUrl);
    
    await prisma.venue.update({
      where: { id: venue.id },
      data: { qrCode }
    });

    venue.qrCode = qrCode;

    res.status(201).json({ success: true, venue });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getVenues = async (req, res) => {
  try {
    const venues = await prisma.venue.findMany({
      where: { ownerId: req.user.id }
    });
    
    res.json({ success: true, venues });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getVenue = async (req, res) => {
  try {
    const venue = await prisma.venue.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    
    res.json({ success: true, venue });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateVenue = async (req, res) => {
  try {
    const venue = await prisma.venue.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    
    res.json({ success: true, venue });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getVenueAnalytics = async (req, res) => {
  try {
    const venue = await prisma.venue.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // Get analytics data
    const playLogs = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "created_at") as date,
        COUNT(*) as plays,
        COUNT(DISTINCT user_id) as unique_users
      FROM play_logs 
      WHERE venue_id = ${parseInt(req.params.id)}
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    `;

    const analytics = {
      totalPlays: venue.totalPlays,
      uniqueUsers: venue.uniqueUsers,
      revenue: venue.revenue,
      dailyStats: playLogs
    };

    res.json({ success: true, analytics });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};