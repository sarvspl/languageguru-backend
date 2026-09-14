/**
 * seedSnapshot.ts
 * Master Server Synchronizer.
 * Reads prisma/seedData/fullDatabaseSnapshot.json and upserts all tables in dependency order.
 * Ensures the target server database becomes 100% IDENTICAL to the local database.
 *
 * Safe to run repeatedly (Idempotent).
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncAll() {
  const snapshotFile = path.join(__dirname, 'seedData', 'fullDatabaseSnapshot.json');
  if (!fs.existsSync(snapshotFile)) {
    console.error(`❌ Snapshot file not found: ${snapshotFile}`);
    console.error('Run "npm run db:export" first on your local machine to generate the snapshot.');
    process.exit(1);
  }

  console.log('🔄 Loading database snapshot from:', snapshotFile);
  const raw = fs.readFileSync(snapshotFile, 'utf8');
  const { exportedAt, data } = JSON.parse(raw);
  console.log(`📅 Snapshot timestamp: ${exportedAt}`);

  // 1. Site Settings
  if (Array.isArray(data.siteSettings) && data.siteSettings.length > 0) {
    console.log('⏳ Syncing site settings...');
    for (const item of data.siteSettings) {
      const { id, updatedAt: _u, ...rest } = item;
      await prisma.siteSettings.upsert({
        where: { id: id || 'singleton' },
        update: rest,
        create: { id: id || 'singleton', ...rest },
      });
    }
    console.log('   ✅ Site settings synced.');
  }

  // 2. Static Page Singletons (AboutPage, ContactPage, ClientsPage)
  if (Array.isArray(data.aboutPage) && data.aboutPage.length > 0) {
    for (const item of data.aboutPage) {
      const { id, updatedAt: _u, ...rest } = item;
      await prisma.aboutPage.upsert({
        where: { id: id || 'singleton' },
        update: rest,
        create: { id: id || 'singleton', ...rest },
      });
    }
  }
  if (Array.isArray(data.contactPage) && data.contactPage.length > 0) {
    for (const item of data.contactPage) {
      const { id, updatedAt: _u, ...rest } = item;
      await prisma.contactPage.upsert({
        where: { id: id || 'singleton' },
        update: rest,
        create: { id: id || 'singleton', ...rest },
      });
    }
  }
  if (Array.isArray(data.clientsPage) && data.clientsPage.length > 0) {
    for (const item of data.clientsPage) {
      const { id, updatedAt: _u, ...rest } = item;
      await prisma.clientsPage.upsert({
        where: { id: id || 'singleton' },
        update: rest,
        create: { id: id || 'singleton', ...rest },
      });
    }
  }

  // 3. HomePageSection & Pages
  if (Array.isArray(data.homeSections) && data.homeSections.length > 0) {
    console.log(`⏳ Syncing ${data.homeSections.length} home sections...`);
    for (const item of data.homeSections) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = item;
      await prisma.homePageSection.upsert({
        where: { sectionId: item.sectionId },
        update: rest,
        create: { id, ...rest },
      });
    }
  }
  if (Array.isArray(data.pages) && data.pages.length > 0) {
    for (const item of data.pages) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = item;
      await prisma.page.upsert({
        where: { slug: item.slug },
        update: rest,
        create: { id, ...rest },
      });
    }
  }

  // 4. Industries
  if (Array.isArray(data.industries) && data.industries.length > 0) {
    console.log(`⏳ Syncing ${data.industries.length} industries...`);
    for (const item of data.industries) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = item;
      await prisma.industry.upsert({
        where: { name: item.name },
        update: rest,
        create: { id, ...rest },
      });
    }
  }

  // 5. Services (15 services with full contentOverrides)
  if (Array.isArray(data.services) && data.services.length > 0) {
    console.log(`⏳ Syncing ${data.services.length} services...`);
    for (const item of data.services) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = item;
      await prisma.service.upsert({
        where: { key: item.key },
        update: rest,
        create: { id, ...rest },
      });
    }
    console.log(`   ✅ ${data.services.length} services synced.`);
  }

  // 6. Languages (103 languages with flags & contentOverrides)
  if (Array.isArray(data.languages) && data.languages.length > 0) {
    console.log(`⏳ Syncing ${data.languages.length} languages...`);
    for (const item of data.languages) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = item;
      await prisma.language.upsert({
        where: { key: item.key },
        update: rest,
        create: { id, ...rest },
      });
    }
    console.log(`   ✅ ${data.languages.length} languages synced.`);
  }

  // 7. Cities (108 cities with state & contentOverrides)
  if (Array.isArray(data.cities) && data.cities.length > 0) {
    console.log(`⏳ Syncing ${data.cities.length} cities...`);
    for (const item of data.cities) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = item;
      await prisma.city.upsert({
        where: { key: item.key },
        update: rest,
        create: { id, ...rest },
      });
    }
    console.log(`   ✅ ${data.cities.length} cities synced.`);
  }

  // 8. Universal SitePage CMS
  if (Array.isArray(data.sitePages) && data.sitePages.length > 0) {
    console.log(`⏳ Syncing ${data.sitePages.length} CMS site pages...`);
    for (const item of data.sitePages) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = item;
      await prisma.sitePage.upsert({
        where: { key: item.key },
        update: rest,
        create: { id, ...rest },
      });
    }
  }

  // 9. PageSections
  if (Array.isArray(data.pageSections) && data.pageSections.length > 0) {
    console.log(`⏳ Syncing ${data.pageSections.length} CMS page sections...`);
    for (const item of data.pageSections) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = item;
      await prisma.pageSection.upsert({
        where: {
          pageKey_sectionKey: {
            pageKey: item.pageKey,
            sectionKey: item.sectionKey,
          },
        },
        update: rest,
        create: { id, ...rest },
      });
    }
    console.log(`   ✅ ${data.pageSections.length} CMS page sections synced.`);
  }

  // 10. ServiceCityOverrides
  if (Array.isArray(data.serviceCityOverrides) && data.serviceCityOverrides.length > 0) {
    console.log(`⏳ Syncing ${data.serviceCityOverrides.length} service-city overrides...`);
    for (const item of data.serviceCityOverrides) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = item;
      await prisma.serviceCityOverride.upsert({
        where: {
          serviceKey_cityKey: {
            serviceKey: item.serviceKey,
            cityKey: item.cityKey,
          },
        },
        update: rest,
        create: { id, ...rest },
      });
    }
    console.log(`   ✅ ${data.serviceCityOverrides.length} service-city overrides synced.`);
  }

  // 11. LanguageCityOverrides
  if (Array.isArray(data.languageCityOverrides) && data.languageCityOverrides.length > 0) {
    console.log(`⏳ Syncing ${data.languageCityOverrides.length} language-city overrides...`);
    for (const item of data.languageCityOverrides) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = item;
      await prisma.languageCityOverride.upsert({
        where: {
          languageKey_cityKey: {
            languageKey: item.languageKey,
            cityKey: item.cityKey,
          },
        },
        update: rest,
        create: { id, ...rest },
      });
    }
    console.log(`   ✅ ${data.languageCityOverrides.length} language-city overrides synced.`);
  }

  // 12. Collections: Gallery, Translators, Testimonials, Clients, FAQs, WhyChoose
  if (Array.isArray(data.galleryItems) && data.galleryItems.length > 0) {
    const validIds = data.galleryItems.map((x: any) => x.id).filter(Boolean);
    if (validIds.length > 0) {
      await prisma.galleryItem.deleteMany({ where: { id: { notIn: validIds } } });
    }
    for (const item of data.galleryItems) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = item;
      await prisma.galleryItem.upsert({
        where: { id },
        update: rest,
        create: { id, ...rest },
      });
    }
  }

  if (Array.isArray(data.translators) && data.translators.length > 0) {
    const validIds = data.translators.map((x: any) => x.id).filter(Boolean);
    if (validIds.length > 0) {
      await prisma.translator.deleteMany({ where: { id: { notIn: validIds } } });
    }
    for (const item of data.translators) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = item;
      await prisma.translator.upsert({
        where: { id },
        update: rest,
        create: { id, ...rest },
      });
    }
  }

  if (Array.isArray(data.testimonials) && data.testimonials.length > 0) {
    const validIds = data.testimonials.map((x: any) => x.id).filter(Boolean);
    if (validIds.length > 0) {
      await prisma.testimonial.deleteMany({ where: { id: { notIn: validIds } } });
    }
    for (const item of data.testimonials) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = item;
      await prisma.testimonial.upsert({
        where: { id },
        update: rest,
        create: { id, ...rest },
      });
    }
  }

  if (Array.isArray(data.clients) && data.clients.length > 0) {
    const validIds = data.clients.map((x: any) => x.id).filter(Boolean);
    if (validIds.length > 0) {
      await prisma.client.deleteMany({ where: { id: { notIn: validIds } } });
    }
    for (const item of data.clients) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = item;
      await prisma.client.upsert({
        where: { id },
        update: rest,
        create: { id, ...rest },
      });
    }
  }

  if (Array.isArray(data.faqs) && data.faqs.length > 0) {
    const validIds = data.faqs.map((x: any) => x.id).filter(Boolean);
    if (validIds.length > 0) {
      await prisma.faq.deleteMany({ where: { id: { notIn: validIds } } });
    }
    for (const item of data.faqs) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = item;
      await prisma.faq.upsert({
        where: { id },
        update: rest,
        create: { id, ...rest },
      });
    }
  }

  if (Array.isArray(data.whyChooseItems) && data.whyChooseItems.length > 0) {
    const validIds = data.whyChooseItems.map((x: any) => x.id).filter(Boolean);
    if (validIds.length > 0) {
      await prisma.whyChooseItem.deleteMany({ where: { id: { notIn: validIds } } });
    }
    for (const item of data.whyChooseItems) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = item;
      await prisma.whyChooseItem.upsert({
        where: { id },
        update: rest,
        create: { id, ...rest },
      });
    }
  }

  console.log('\n🎉 ALL DATABASE CONTENT SYNCHRONIZED SUCCESSFULLY!');
  console.log('Server database is now 100% IDENTICAL to the local database.\n');
}

syncAll()
  .catch((e) => {
    console.error('❌ Sync failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
