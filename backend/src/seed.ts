import mongoose from 'mongoose';
import { User } from './models/User.model';
import { env } from './config/env';
import { logger } from './config/logger';

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI as string);
    logger.info('Connected to MongoDB for seeding');

    // Clear existing users
    await User.deleteMany({});
    logger.info('Cleared existing users');

    // Create test users
    const testUsers = [
      {
        email: 'buyer@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Buyer',
        phone: '1234567890',
        roles: ['BUYER'],
        businessName: 'Gem Buyer Inc',
      },
      {
        email: 'seller@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Seller',
        phone: '0987654321',
        roles: ['SELLER'],
        businessName: 'Premium Gems Ltd',
      },
      {
        email: 'cutter@test.com',
        password: 'password123',
        firstName: 'Mike',
        lastName: 'Cutter',
        phone: '5555555555',
        roles: ['CUTTER'],
        businessName: 'Expert Cutting Studio',
      },
      {
        email: 'admin@test.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        phone: '9999999999',
        roles: ['ADMIN', 'BUYER'],
        businessName: 'Admin Account',
      },
      {
        email: 'demo@test.com',
        password: 'password123',
        firstName: 'Demo',
        lastName: 'User',
        phone: '1111111111',
        roles: ['BUYER', 'SELLER'],
        businessName: 'Demo Trading',
      },
    ];

    const createdUsers = await User.create(testUsers);
    logger.info(`✅ Seeded ${createdUsers.length} test users`);

    // Display created users
    console.log('\n📋 Created Test Users:');
    console.log('================================');
    createdUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Password: password123`);
      console.log(`   Roles: ${user.roles.join(', ')}`);
    });
    console.log('\n================================\n');

    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    logger.error('Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
