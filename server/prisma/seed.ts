import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('MyDJTV2024!Admin', 12);
  const venuePassword = await bcrypt.hash('Venue2024!Secure', 12);
  const userPassword = await bcrypt.hash('User2024!Demo', 12);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mydjtv.com' },
    update: {},
    create: {
      email: 'admin@mydjtv.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      subscriptionStatus: 'ENTERPRISE',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create Venue Owner
  const venueOwner = await prisma.user.upsert({
    where: { email: 'venue@mydjtv.com' },
    update: {},
    create: {
      email: 'venue@mydjtv.com',
      passwordHash: venuePassword,
      role: 'VENUE_OWNER',
      subscriptionStatus: 'PREMIUM',
    },
  });

  console.log('✅ Venue owner created:', venueOwner.email);

  // Create Premium User
  const premiumUser = await prisma.user.upsert({
    where: { email: 'user@mydjtv.com' },
    update: {},
    create: {
      email: 'user@mydjtv.com',
      passwordHash: userPassword,
      role: 'USER',
      subscriptionStatus: 'PREMIUM',
    },
  });

  console.log('✅ Premium user created:', premiumUser.email);

  // Create Demo Venue
  const venue = await prisma.venue.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Demo Restaurant',
      address: '123 Main St, Demo City',
      phone: '+1-555-0123',
      email: 'demo@restaurant.com',
      ownerId: venueOwner.id,
      settings: {
        maxUsers: 100,
        commercialFrequency: 5,
        allowUserRequests: true,
        autoPlay: true,
        volume: 50,
        genres: ['jazz', 'lounge', 'ambient'],
        blacklistedWords: ['explicit', 'banned'],
      },
    },
  });

  console.log('✅ Demo venue created:', venue.name);

  // Create Demo Playlist
  const playlist = await prisma.playlist.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Restaurant Ambience',
      description: 'Perfect background music for dining',
      venueId: venue.id,
      creatorId: venueOwner.id,
      isPublic: true,
      tracks: [
        {
          id: 'demo1',
          name: 'Smooth Jazz Cafe',
          artist: 'Demo Artist',
          duration: 180,
          url: 'https://demo.com/track1',
          spotifyId: 'spotify:track:demo1',
          genre: 'jazz',
          bpm: 120,
          energy: 0.6,
        },
        {
          id: 'demo2',
          name: 'Ambient Lounge',
          artist: 'Demo Artist 2',
          duration: 240,
          url: 'https://demo.com/track2',
          spotifyId: 'spotify:track:demo2',
          genre: 'ambient',
          bpm: 90,
          energy: 0.4,
        },
        {
          id: 'demo3',
          name: 'Relaxing Instrumental',
          artist: 'Demo Artist 3',
          duration: 200,
          url: 'https://demo.com/track3',
          spotifyId: 'spotify:track:demo3',
          genre: 'instrumental',
          bpm: 100,
          energy: 0.5,
        },
      ],
      settings: {
        shuffleEnabled: true,
        repeatEnabled: false,
        crossfadeEnabled: true,
        crossfadeDuration: 5,
      },
    },
  });

  console.log('✅ Demo playlist created:', playlist.name);

  // Create Demo Commercial
  const commercial = await prisma.commercial.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Daily Special Announcement',
      description: 'Promoting today\'s special menu',
      audioUrl: 'https://demo.com/commercial1',
      duration: 30,
      venueId: venue.id,
      settings: {
        playFrequency: 5, // Every 5 songs
        volumeLevel: 0.8,
        fadeInDuration: 2,
        fadeOutDuration: 2,
        schedule: {
          enabled: true,
          startTime: '09:00',
          endTime: '22:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        },
      },
    },
  });

  console.log('✅ Demo commercial created:', commercial.title);

  // Create Venue Session
  const venueSession = await prisma.venueSession.upsert({
    where: { id: 'demo-session-1' },
    update: {},
    create: {
      id: 'demo-session-1',
      venueId: venue.id,
      currentTrack: {
        id: 'demo1',
        name: 'Smooth Jazz Cafe',
        artist: 'Demo Artist',
        duration: 180,
        position: 0,
        startedAt: new Date().toISOString(),
        spotifyId: 'spotify:track:demo1',
        genre: 'jazz',
      },
      isPlaying: false,
      volume: 50,
      connectedUsers: 0,
    },
  });

  console.log('✅ Demo venue session created');

  // Create sample analytics
  const analyticsData = [
    {
      userId: premiumUser.id,
      event: 'song_request',
      data: {
        trackId: 'demo1',
        trackName: 'Smooth Jazz Cafe',
        artist: 'Demo Artist',
        requestedAt: new Date().toISOString(),
        approved: true,
      },
    },
    {
      userId: premiumUser.id,
      event: 'playlist_interaction',
      data: {
        action: 'like',
        playlistId: playlist.id,
        playlistName: playlist.name,
        interactionAt: new Date().toISOString(),
      },
    },
    {
      userId: venueOwner.id,
      event: 'commercial_played',
      data: {
        commercialId: commercial.id,
        commercialTitle: commercial.title,
        playedAt: new Date().toISOString(),
        duration: commercial.duration,
        venueId: venue.id,
      },
    },
  ];

  for (const analyticsEntry of analyticsData) {
    await prisma.userAnalytics.create({
      data: analyticsEntry,
    });
  }

  console.log('✅ Sample analytics created');

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('Admin: admin@mydjtv.com / MyDJTV2024!Admin');
  console.log('Venue Owner: venue@mydjtv.com / Venue2024!Secure');
  console.log('Premium User: user@mydjtv.com / User2024!Demo');
  console.log('\n🏢 Demo Venue: Demo Restaurant');
  console.log('🎵 Demo Playlist: Restaurant Ambience (3 tracks)');
  console.log('📢 Demo Commercial: Daily Special Announcement');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });