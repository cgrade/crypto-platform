const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  // Check if admin exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (existingAdmin) {
    console.log('Admin account already exists:', existingAdmin.email);
    return;
  }

  // Create admin if none exists
  try {
    const hashedPassword = await bcrypt.hash('Admin@123456', 10);
    
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@cryptopro.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    
    console.log('Admin account created successfully:');
    console.log(`Email: ${admin.email}`);
    console.log('Password: Admin@123456');
  } catch (error) {
    console.error('Error creating admin account:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Create a function to update existing user to admin
async function updateUserToAdmin(email) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    
    console.log(`User ${user.email} has been updated to ADMIN role`);
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Check command line args
if (process.argv[2] === '--update' && process.argv[3]) {
  updateUserToAdmin(process.argv[3]);
} else {
  main();
}
