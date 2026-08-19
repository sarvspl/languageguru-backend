import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { LANGUAGES } from '../../my-app/data/languages';
import { CITIES } from '../../my-app/data/cities';
import { SERVICES_LIST as SERVICES, LG_SVC_DATA } from '../../my-app/data/services';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding with FULL Frontend Data...');

  // 1. Seed Super Admin
  const adminUsername = 'admin';
  const existingAdmin = await prisma.adminUser.findUnique({ where: { username: adminUsername } });

  if (!existingAdmin) {
    const crypto = require('crypto');
    const defaultPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(6).toString('hex');
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    await prisma.adminUser.create({
      data: {
        username: adminUsername,
        passwordHash,
        name: 'Super Admin',
        role: 'SUPER_ADMIN'
      }
    });
    console.log(`✅ Created Super Admin user: admin (password: ${defaultPassword})`);
    if (!process.env.ADMIN_PASSWORD) {
      console.log('⚠️  WARNING: A random password was generated. Please change it immediately or set ADMIN_PASSWORD in your environment variables.');
    }
  }

  // 2. Seed Languages
  console.log(`⏳ Seeding ${LANGUAGES.length} Languages...`);
  for (const lang of LANGUAGES) {
    await prisma.language.upsert({
      where: { key: lang.key },
      update: {
        name: lang.name,
        flag: lang.flag,
        native: lang.native || '',
        cat: lang.cat || '',
        speakers: lang.speakers || '',
        region: lang.region || '',
        difficulty: lang.difficulty || '',
        script: lang.script || null,
        price: lang.price || null,
        isActive: true,
      },
      create: {
        key: lang.key,
        name: lang.name,
        flag: lang.flag,
        native: lang.native || '',
        cat: lang.cat || '',
        speakers: lang.speakers || '',
        region: lang.region || '',
        difficulty: lang.difficulty || '',
        script: lang.script || null,
        price: lang.price || null,
        isActive: true,
      }
    });
  }
  console.log(`✅ Successfully seeded ${LANGUAGES.length} Languages!`);

  // 3. Seed Cities
  console.log(`⏳ Seeding ${CITIES.length} Cities...`);
  for (const city of CITIES) {
    // Generate a simple key from city name if it doesn't exist
    const cityKey = city.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    await prisma.city.upsert({
      where: { key: cityKey },
      update: {
        name: city.name,
        ic: city.ic || '🏙️',
        state: city.state,
        // Assume true if 'metro' isn't defined or just set standard flag
        isMetro: true, 
      },
      create: {
        key: cityKey,
        name: city.name,
        ic: city.ic || '🏙️',
        state: city.state,
        isMetro: true,
      }
    });
  }
  console.log(`✅ Successfully seeded ${CITIES.length} Cities!`);

  // 4. Seed Services
  console.log(`⏳ Seeding ${SERVICES.length} Services...`);
  for (const svc of SERVICES) {
    // Generate key from service name
    const svcKey = svc.key || svc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const detail = LG_SVC_DATA[svcKey] || {};
    
    const updateData = {
        name: svc.name,
        icon: svc.icon,
        description: svc.short,
        short: svc.short || '',
        price: svc.price || 0,
        fast: svc.fast || 0,
        label: detail.label || '',
        tag: detail.tag || '',
        title: detail.title || '',
        alt: detail.alt || false,
        p1: detail.p1 || '',
        p2: detail.p2 || '',
        features: detail.features || [],
        docs: detail.docs || [],
        ctaLabel: detail.ctaLabel || '',
        ctaKey: detail.ctaKey || ''
    };

    await prisma.service.upsert({
      where: { key: svcKey },
      update: updateData,
      create: {
        key: svcKey,
        ...updateData
      }
    });
  }
  console.log(`✅ Successfully seeded ${SERVICES.length} Services!`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
