const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    console.log('Testing Prisma connection...');
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Connection successful!', result);
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
