import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const createInitialData = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@mydjtv.com' }
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD || 'MyDJTV2024!Admin',
        12
      );

      await prisma.user.create({
        data: {
          name: 'Admin MyDJTV',
          email: 'admin@mydjtv.com',
          password: hashedPassword,
          role: 'admin',
          is_premium: true,
          subscription_status: 'active'
        }
      });
      console.log('✅ Admin user created: admin@mydjtv.com');
    }

    // Create demo venue owner
    const venueOwnerExists = await prisma.user.findUnique({
      where: { email: 'venue@mydjtv.com' }
    });

    let venueOwner;
    if (!venueOwnerExists) {
      const hashedPassword = await bcrypt.hash(
        process.env.VENUE_PASSWORD || 'MyDJTV2024!Venue',
        12
      );

      venueOwner = await prisma.user.create({
        data: {
          name: 'Café Central Owner',
          email: 'venue@mydjtv.com',
          password: hashedPassword,
          role: 'venue',
          is_premium: true,
          subscription_status: 'active'
        }
      });
      console.log('✅ Venue owner created: venue@mydjtv.com');
    } else {
      venueOwner = venueOwnerExists;
    }

    // Create demo venue
    const venueExists = await prisma.venue.findFirst({
      where: { name: 'Café Central Demo' }
    });

    if (!venueExists) {
      await prisma.venue.create({
        data: {
          name: 'Café Central Demo',
          type: 'Restaurant',
          location: 'Downtown',
          owner_id: venueOwner.id,
          branding: {
            logo: '/Mydjtv.jpg',
            primaryColor: '#0EA5E9',
            secondaryColor: '#06B6D4'
          },
          settings: {
            maxSongsPerUser: 3,
            commercialFrequency: 5,
            enableUserRequests: true
          }
        }
      });
      console.log('✅ Demo venue created: Café Central Demo');
    }

    // Create demo user with premium subscription
    const userExists = await prisma.user.findUnique({
      where: { email: 'user@mydjtv.com' }
    });

    if (!userExists) {
      const hashedPassword = await bcrypt.hash(
        process.env.USER_PASSWORD || 'MyDJTV2024!User',
        12
      );

      await prisma.user.create({
        data: {
          name: 'Demo User',
          email: 'user@mydjtv.com',
          password: hashedPassword,
          role: 'user',
          is_premium: true,
          subscription_status: 'active'
        }
      });
      console.log('✅ Premium user created: user@mydjtv.com');
    }

    // Create some sample tracks
    const sampleTracks = [
      {
        spotify_id: 'demo_track_1',
        name: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        duration_ms: 200040,
        popularity: 95,
        genres: ['pop', 'r&b'],
        audio_features: {
          energy: 0.8,
          valence: 0.7,
          danceability: 0.9
        }
      },
      {
        spotify_id: 'demo_track_2',
        name: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        duration_ms: 203064,
        popularity: 88,
        genres: ['pop', 'dance'],
        audio_features: {
          energy: 0.9,
          valence: 0.8,
          danceability: 0.95
        }
      },
      {
        spotify_id: 'demo_track_3',
        name: 'Good 4 U',
        artist: 'Olivia Rodrigo',
        album: 'SOUR',
        duration_ms: 178147,
        popularity: 92,
        genres: ['pop', 'rock'],
        audio_features: {
          energy: 0.85,
          valence: 0.6,
          danceability: 0.7
        }
      }
    ];

    for (const track of sampleTracks) {
      const trackExists = await prisma.track.findUnique({
        where: { spotify_id: track.spotify_id }
      });

      if (!trackExists) {
        await prisma.track.create({ data: track });
      }
    }
    console.log('✅ Sample tracks created');

    console.log('\n🎉 Database seed completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@mydjtv.com / [check ADMIN_PASSWORD env var]');
    console.log('Venue: venue@mydjtv.com / [check VENUE_PASSWORD env var]');
    console.log('User: user@mydjtv.com / [check USER_PASSWORD env var]');
    console.log('\n🔐 Default passwords (if env vars not set):');
    console.log('Admin: MyDJTV2024!Admin');
    console.log('Venue: MyDJTV2024!Venue');
    console.log('User: MyDJTV2024!User');

  } catch (error) {
    console.error('❌ Error during seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

createInitialData();