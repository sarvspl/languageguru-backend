const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
});

// CFG-07: release pooled connections instead of leaking them on restart/deploy.
let shuttingDown = false;
const disconnect = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  try {
    await prisma.$disconnect();
    console.log(`Prisma disconnected (${signal}).`);
  } catch (err) {
    console.error('Error disconnecting Prisma:', err);
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', () => disconnect('SIGINT'));
process.on('SIGTERM', () => disconnect('SIGTERM'));
process.on('beforeExit', async () => {
  if (!shuttingDown) await prisma.$disconnect();
});

module.exports = prisma;
