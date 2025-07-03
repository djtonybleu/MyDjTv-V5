import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  location: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branding: {
    logo: String,
    primaryColor: { type: String, default: '#0EA5E9' },
    secondaryColor: { type: String, default: '#06B6D4' }
  },
  settings: {
    maxUsers: { type: Number, default: 50 },
    commercialFrequency: { type: Number, default: 3 }, // Every 3 songs
    allowExplicit: { type: Boolean, default: false }
  },
  subscription: {
    plan: { type: String, enum: ['basic', 'premium', 'enterprise'], default: 'basic' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  analytics: {
    totalPlays: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  qrCode: String
}, { timestamps: true });

export default mongoose.model('Venue', venueSchema);