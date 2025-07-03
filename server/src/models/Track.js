import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: String,
  duration: { type: Number, required: true },
  thumbnail: String,
  audioUrl: String,
  spotifyId: String,
  genre: [String],
  explicit: { type: Boolean, default: false },
  popularity: { type: Number, default: 0 },
  plays: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Track', trackSchema);