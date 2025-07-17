import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  try {
    // Create admin user
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@mydjtv.com' }
    });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('MyDJTV2024!', 12);
      await prisma.user.create({
        data: {
          name: 'Admin MyDJTV',
          email: 'admin@mydjtv.com',
          password: hashedPassword,
          role: 'admin'
        }
      });
      console.log('✅ Admin created: admin@mydjtv.com');
    }

    // Create venue owner
    const venueOwnerExists = await prisma.user.findUnique({
      where: { email: 'venue@mydjtv.com' }
    });
    
    if (!venueOwnerExists) {
      const hashedPassword = await bcrypt.hash('Venue2024!', 12);
      const venueOwner = await prisma.user.create({
        data: {
          name: 'Café Central Owner',
          email: 'venue@mydjtv.com',
          password: hashedPassword,
          role: 'venue'
        }
      });

      const venue = await prisma.venue.create({
        data: {
          name: 'Café Central',
          type: 'Restaurant',
          location: 'Downtown',
          ownerId: venueOwner.id,
          logo: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
        }
      });

      await prisma.user.update({
        where: { id: venueOwner.id },
        data: { venueId: venue.id }
      });

      console.log('✅ Venue owner created: venue@mydjtv.com');
      console.log('✅ Demo venue created');
    }

    console.log('\n🎉 Production data initialized!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();