import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seed...');

    // Clear existing users if any
    await prisma.cryptoAsset.deleteMany();
    await prisma.portfolio.deleteMany();
    await prisma.user.deleteMany();

    console.log('Cleared existing data');

    // Create admin account
    const adminPassword = await hash('Admin123!', 10);
    
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'ADMIN',
        btcAddress: 'bc1q3v5cu3zgev8mcptgj79nnzr9vj2qzcd0g5lph9',
        btcAddressQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bc1q3v5cu3zgev8mcptgj79nnzr9vj2qzcd0g5lph9'
      }
    });
    
    console.log('Admin user created:', admin.id);
    
    // Create regular user account
    const userPassword = await hash('User123!', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'Bitcoin Investor',
        email: 'user@example.com',
        password: userPassword,
        role: 'USER',
        btcAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        btcAddressQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        portfolios: {
          create: { 
            totalValue: 0,
            assets: {
              create: [
                {
                  amount: 0.25,
                  symbol: 'BTC',
                  name: 'Bitcoin'
                }
              ]
            }
          }
        }
      }
    });
    
    console.log('Regular user created:', user.id);
    
    // Create additional test users
    const testUser1 = await prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: await hash('User123!', 10),
        role: 'USER'
      }
    });
    
    console.log('Test user 1 created:', testUser1.id);
    
    const testUser2 = await prisma.user.create({
      data: {
        name: 'Robert Johnson',
        email: 'robert@example.com',
        password: await hash('User123!', 10),
        role: 'USER',
        btcAddress: 'bc1q9jvmqt0r247dfhy86sxm5wgpgdv5xqpgxz6qgr',
        btcAddressQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bc1q9jvmqt0r247dfhy86sxm5wgpgdv5xqpgxz6qgr',
        portfolios: {
          create: { 
            totalValue: 0,
            assets: {
              create: [
                {
                  amount: 0.15,
                  symbol: 'BTC',
                  name: 'Bitcoin'
                }
              ]
            }
          }
        }
      }
    });
    
    console.log('Test user 2 created:', testUser2.id);
    
  } catch (error) {
    console.error('Error during database seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
