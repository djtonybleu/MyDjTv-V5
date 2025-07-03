import { connectDB } from '../config/database.js';
import User from '../models/User.js';
import Venue from '../models/Venue.js';
import dotenv from 'dotenv';

dotenv.config();

const createInitialData = async () => {
  try {
    await connectDB();
    
    // Create admin user
    const adminExists = await User.findByEmail('admin@mydjtv.com');
    if (!adminExists) {
      await User.create({
        name: 'Admin MyDJTV',
        email: 'admin@mydjtv.com',
        password: 'MyDJTV2024!',
        role: 'admin'
      });
      console.log('✅ Admin created: admin@mydjtv.com');
    }

    // Create venue owner
    const venueOwnerExists = await User.findByEmail('venue@mydjtv.com');
    if (!venueOwnerExists) {
      const venueOwner = await User.create({
        name: 'Café Central Owner',
        email: 'venue@mydjtv.com',
        password: 'Venue2024!',
        role: 'venue'
      });

      const venue = await Venue.create({
        name: 'Café Central',
        type: 'Restaurant',
        location: 'Downtown',
        owner_id: venueOwner.id,
        logo: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      });

      console.log('✅ Venue owner created: venue@mydjtv.com');
      console.log('✅ Demo venue created');
    }

    console.log('\n🎉 Production data initialized!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createInitialData();