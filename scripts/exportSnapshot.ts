/**
 * exportSnapshot.ts
 * Exports the entire local database state into a single portable JSON snapshot
 * at prisma/seedData/fullDatabaseSnapshot.json.
 *
 * This allows 1-click 100% identical synchronization between local and production.
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function exportAll() {
  console.log('📦 Exporting full local database snapshot...');

  const [
    siteSettings,
    aboutPage,
    contactPage,
    clientsPage,
    homeSections,
    pages,
    sitePages,
    pageSections,
    services,
    languages,
    cities,
    serviceCityOverrides,
    languageCityOverrides,
    industries,
    galleryItems,
    translators,
    testimonials,
    clients,
    faqs,
    whyChooseItems,
  ] = await Promise.all([
    prisma.siteSettings.findMany(),
    prisma.aboutPage.findMany(),
    prisma.contactPage.findMany(),
    prisma.clientsPage.findMany(),
    prisma.homePageSection.findMany(),
    prisma.page.findMany(),
    prisma.sitePage.findMany(),
    prisma.pageSection.findMany(),
    prisma.service.findMany(),
    prisma.language.findMany(),
    prisma.city.findMany(),
    prisma.serviceCityOverride.findMany(),
    prisma.languageCityOverride.findMany(),
    prisma.industry.findMany(),
    prisma.galleryItem.findMany(),
    prisma.translator.findMany(),
    prisma.testimonial.findMany(),
    prisma.client.findMany(),
    prisma.faq.findMany(),
    prisma.whyChooseItem.findMany(),
  ]);

  const snapshot = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    data: {
      siteSettings,
      aboutPage,
      contactPage,
      clientsPage,
      homeSections,
      pages,
      sitePages,
      pageSections,
      services,
      languages,
      cities,
      serviceCityOverrides,
      languageCityOverrides,
      industries,
      galleryItems,
      translators,
      testimonials,
      clients,
      faqs,
      whyChooseItems,
    },
  };

  const targetDir = path.join(__dirname, '../prisma/seedData');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetFile = path.join(targetDir, 'fullDatabaseSnapshot.json');
  fs.writeFileSync(targetFile, JSON.stringify(snapshot, null, 2), 'utf8');

  console.log(`✅ Successfully exported snapshot to ${targetFile}`);
  console.log(`   - Services: ${services.length}`);
  console.log(`   - Languages: ${languages.length}`);
  console.log(`   - Cities: ${cities.length}`);
  console.log(`   - ServiceCityOverrides: ${serviceCityOverrides.length}`);
  console.log(`   - LanguageCityOverrides: ${languageCityOverrides.length}`);
  console.log(`   - SitePages: ${sitePages.length}`);
  console.log(`   - PageSections: ${pageSections.length}`);
  console.log(`   - SiteSettings: ${siteSettings.length}`);
  console.log(`   - Testimonials: ${testimonials.length}`);
  console.log(`   - FAQs: ${faqs.length}`);
  console.log(`   - WhyChooseItems: ${whyChooseItems.length}`);
  console.log(`   - Translators: ${translators.length}`);
  console.log(`   - GalleryItems: ${galleryItems.length}`);
  console.log(`   - Clients: ${clients.length}`);
  console.log(`   - Industries: ${industries.length}`);
}

exportAll()
  .catch((e) => {
    console.error('❌ Export failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
