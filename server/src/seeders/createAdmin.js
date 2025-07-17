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
        password: process.env.ADMIN_PASSWORD || 'MyDJTV2024!Admin',
        role: 'admin'
      });
      console.log('✅ Admin user created: admin@mydjtv.com / [password from env]');
    }

    // Create demo venue owner
    const venueOwnerExists = await User.findOne({ email: 'venue@mydjtv.com' });
    if (!venueOwnerExists) {
      const venueOwner = await User.create({
        name: 'Café Central Owner',
        email: 'venue@mydjtv.com',
        password: process.env.VENUE_PASSWORD || 'MyDJTV2024!Venue',
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
      
      console.log('✅ Venue owner created: venue@mydjtv.com / [password from env]');
    }

    // Create demo user with premium subscription
    const userExists = await User.findOne({ email: 'user@mydjtv.com' });
    if (!userExists) {
      await User.create({
        name: 'Demo User',
        email: 'user@mydjtv.com',
        password: process.env.USER_PASSWORD || 'MyDJTV2024!User',
        role: 'user',
        subscription: {
          status: 'active',
          plan: 'premium'
        }
      });
      console.log('✅ Premium user created: user@mydjtv.com / [password from env]');
    }

    console.log('\n🎉 Initial data created!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@mydjtv.com / [check ADMIN_PASSWORD env var]');
    console.log('Venue: venue@mydjtv.com / [check VENUE_PASSWORD env var]');
    console.log('User: user@mydjtv.com / [check USER_PASSWORD env var]');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createInitialData();