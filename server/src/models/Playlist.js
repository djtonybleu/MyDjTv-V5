import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
  isActive: { type: Boolean, default: false },
  genre: String,
  mood: String,
  timeOfDay: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'] }
}, { timestamps: true });

export default mongoose.model('Playlist', playlistSchema);