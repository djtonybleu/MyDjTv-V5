import mongoose from 'mongoose';

const commercialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  audioUrl: { type: String, required: true },
  thumbnail: String,
  duration: { type: Number, required: true },
  active: { type: Boolean, default: true },
  analytics: {
    plays: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 }
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    frequency: { type: Number, default: 3 } // Every N songs
  }
}, { timestamps: true });

export default mongoose.model('Commercial', commercialSchema);