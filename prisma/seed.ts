/**
 * ADMIN SEED — this file seeds the admin user and nothing else.
 *
 * Catalog data (languages, cities, services, industries) lives in seedCatalog.ts.
 * Page and section content lives in seedContent.ts.
 * `npm run seed:all` runs all three in the correct order.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Seeding admin user…');

  const username = process.env.ADMIN_USERNAME || 'admin';
  const existing = await prisma.adminUser.findUnique({ where: { username } });

  if (existing) {
    console.log(`   ↳ admin user "${username}" already exists — left untouched.`);
    return;
  }

  // SEC-05: never ship a known default. Use ADMIN_PASSWORD when provided,
  // otherwise generate one and print it exactly once.
  const generated = !process.env.ADMIN_PASSWORD;
  const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url');
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.create({
    data: {
      username,
      passwordHash,
      name: process.env.ADMIN_NAME || 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });

  console.log(`   ✅ created admin user "${username}"`);
  if (generated) {
    console.log(`   🔑 generated password: ${password}`);
    console.log('   ⚠️  Change it on first login, or set ADMIN_PASSWORD and re-seed a fresh database.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Admin seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
