import Venue from '../models/Venue.js';
import QRCode from 'qrcode';

export const createVenue = async (req, res) => {
  try {
    const { name, type, location, branding } = req.body;
    
    const venue = await Venue.create({
      name,
      type,
      location,
      owner: req.user._id,
      branding
    });

    // Generate QR code
    const qrCodeUrl = `${process.env.CLIENT_URL}/remote?venue=${venue._id}`;
    const qrCode = await QRCode.toDataURL(qrCodeUrl);
    venue.qrCode = qrCode;
    await venue.save();

    res.status(201).json({ success: true, venue });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getVenues = async (req, res) => {
  try {
    const venues = await Venue.find({ owner: req.user._id });
    res.json({ success: true, venues });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
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
    const venue = await Venue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    
    res.json({ success: true, venue });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getVenueAnalytics = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // Mock analytics data - replace with real analytics
    const analytics = {
      totalPlays: venue.analytics.totalPlays,
      uniqueUsers: venue.analytics.uniqueUsers,
      revenue: venue.analytics.revenue,
      dailyStats: [
        { date: '2024-01-01', plays: 45, users: 12 },
        { date: '2024-01-02', plays: 67, users: 18 },
        { date: '2024-01-03', plays: 89, users: 23 }
      ]
    };

    res.json({ success: true, analytics });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};