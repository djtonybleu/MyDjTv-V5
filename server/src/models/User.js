import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'venue', 'admin'], default: 'user' },
  subscription: {
    status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'inactive' },
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    stripeCustomerId: String,
    subscriptionId: String,
    expiresAt: Date
  },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  preferences: {
    genres: [String],
    volume: { type: Number, default: 75 }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);