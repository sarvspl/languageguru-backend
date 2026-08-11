const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const hash = "$2b$10$ewYYo5dD8yJVoJC2U.D94emfOZvC6JLvAASV4loBQtgnoyg8hEPdi"; // 123456
prisma.adminUser.update({ where: { username: 'admin' }, data: { passwordHash: hash } }).then(() => { console.log('Updated'); process.exit(); });
