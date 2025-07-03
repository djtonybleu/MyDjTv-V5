import mongoose from 'mongoose';
import User from '../models/User.js';
import Venue from '../models/Venue.js';
import dotenv from 'dotenv';

dotenv.config();

const createInitialData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mydjtv');
    
    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@mydjtv.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin MyDJTV',
        email: 'admin@mydjtv.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin user created: admin@mydjtv.com / admin123');
    }

    // Create demo venue owner
    const venueOwnerExists = await User.findOne({ email: 'venue@mydjtv.com' });
    if (!venueOwnerExists) {
      const venueOwner = await User.create({
        name: 'Café Central Owner',
        email: 'venue@mydjtv.com',
        password: 'venue123',
        role: 'venue'
      });

      // Create demo venue
      const venue = await Venue.create({
        name: 'Café Central Demo',
        type: 'Restaurant',
        location: 'Downtown',
        owner: venueOwner._id,
        branding: {
          logo: '/Mydjtv.jpg',
          primaryColor: '#0EA5E9',
          secondaryColor: '#06B6D4'
        }
      });

      venueOwner.venue = venue._id;
      await venueOwner.save();
      
      console.log('✅ Venue owner created: venue@mydjtv.com / venue123');
    }

    // Create demo user with premium subscription
    const userExists = await User.findOne({ email: 'user@mydjtv.com' });
    if (!userExists) {
      await User.create({
        name: 'Demo User',
        email: 'user@mydjtv.com',
        password: 'user123',
        role: 'user',
        subscription: {
          status: 'active',
          plan: 'premium'
        }
      });
      console.log('✅ Premium user created: user@mydjtv.com / user123');
    }

    console.log('\n🎉 Initial data created!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@mydjtv.com / admin123');
    console.log('Venue: venue@mydjtv.com / venue123');
    console.log('User: user@mydjtv.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createInitialData();