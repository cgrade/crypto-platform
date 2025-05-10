const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Seeding database...');
    
    // Create admin user with hashed password
    const adminPassword = await hash('Admin123!', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@cryptopro.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@cryptopro.com',
        password: adminPassword,
        role: 'ADMIN',
        portfolios: {
          create: { 
            totalValue: 0
          }
        }
      }
    });
    
    console.log('Admin user created:', admin.id);
    
    // Create test user account
    const userPassword = await hash('User123!', 10);
    
    const user = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        name: 'Test User',
        email: 'user@example.com',
        password: userPassword,
        role: 'USER',
        portfolios: {
          create: { 
            totalValue: 0,
            assets: {
              create: [
                {
                  symbol: 'BTC',
                  name: 'Bitcoin',
                  amount: 0.5
                }
              ]
            }
          }
        }
      }
    });
    
    console.log('Test user created:', user.id);
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
