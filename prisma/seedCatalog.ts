/**
 * CATALOG SEED — the entity catalog the site is built around:
 * languages, cities, services and industries.
 *
 * Idempotent: every write is an upsert keyed on `key`, so running it again
 * refreshes catalog rows without touching anything an admin has added.
 */
import { PrismaClient } from '@prisma/client';

import { LANGUAGES } from '../../languageguru-web/data/languages';
import { CITIES } from '../../languageguru-web/data/cities';
import { SERVICES_LIST as SERVICES, LG_SVC_DATA } from '../../languageguru-web/data/services';

const prisma = new PrismaClient();

export const slugify = (v: string) =>
  String(v || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const INDUSTRIES = [
  { icon: '⚖️',  name: 'Legal & Court',        desc: 'Contracts · Patents · Court Orders · Affidavits · Judgments',   svc: 'legal' },
  { icon: '🏥',  name: 'Healthcare & Pharma',  desc: 'Pharma dossiers · Clinical trials · Medical records · Audits',  svc: 'medical' },
  { icon: '🏭',  name: 'Manufacturing',        desc: 'Technical manuals · Engineering drawings · Machine installation', svc: 'technical' },
  { icon: '💻',  name: 'Technology & IT',      desc: 'Software · API documentation · App & website localization',     svc: 'technical' },
  { icon: '🏦',  name: 'Banking & Finance',    desc: 'Annual reports · Bank statements · Regulatory filings',         svc: 'financial' },
  { icon: '🎓',  name: 'Education & Academic', desc: 'Degree certificates · Transcripts · Research papers · DDV',     svc: 'academic' },
  { icon: '🏛️', name: 'Government & Public',  desc: 'Diplomatic correspondence · Tenders · Official documents',      svc: 'certified' },
  { icon: '✈️',  name: 'Travel & Immigration', desc: 'Visa documents · PCC · Passport · Birth & marriage certificates', svc: 'visa' },
];

async function seedLanguages() {
  console.log(`⏳ ${LANGUAGES.length} languages…`);
  for (const l of LANGUAGES) {
    const data = {
      name: l.name,
      flag: l.flag,
      native: l.native || '',
      cat: l.cat || '',
      speakers: l.speakers || '',
      region: l.region || '',
      difficulty: l.difficulty || '',
      script: l.script || null,
      price: l.price ?? null,
      metaTitle: `${l.name} Translation Services in India | Language Guru`,
      metaDesc: `Certified ${l.name} translation services. Embassy-accepted, ISO-9001:2015 and ISO 17100:2015 certified, delivered across India.`,
      isActive: true,
    };
    await prisma.language.upsert({ where: { key: l.key }, update: data, create: { key: l.key, ...data } });
  }
  console.log(`   ✅ ${LANGUAGES.length} languages`);
}

async function seedCities() {
  console.log(`⏳ ${CITIES.length} cities…`);
  const METROS = new Set(['New Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad']);
  for (const c of CITIES) {
    const key = slugify(c.name);
    const data = {
      name: c.name,
      ic: c.ic || '🏙️',
      state: c.state || null,
      isMetro: METROS.has(c.name),
      metaTitle: `Translation Services in ${c.name} | Language Guru`,
      metaDesc: `ISO-certified translation services in ${c.name} across 120+ languages. Embassy-accepted and government-authorized.`,
      isActive: true,
    };
    await prisma.city.upsert({ where: { key }, update: data, create: { key, ...data } });
  }
  console.log(`   ✅ ${CITIES.length} cities`);
}

async function seedServices() {
  console.log(`⏳ ${SERVICES.length} services…`);
  for (const s of SERVICES) {
    const key = s.key || slugify(s.name);
    const d: any = (LG_SVC_DATA as any)[key] || {};
    const data = {
      name: s.name,
      icon: s.icon,
      short: s.short || '',
      description: s.short || '',
      price: s.price ?? 0,
      fast: s.fast ?? 0,
      label: d.label || '',
      tag: d.tag || '',
      title: d.title || `${s.name} <em>Services</em>`,
      alt: d.alt ?? false,
      p1: d.p1 || s.short || '',
      p2: d.p2 || '',
      features: d.features || [],
      docs: d.docs || [],
      ctaLabel: d.ctaLabel || `Get ${s.name} Quote →`,
      ctaKey: d.ctaKey || key,
      metaTitle: `${s.name} Services in Delhi | Language Guru`,
      metaDesc: (s.short || s.name) + ' — ISO-9001:2015 and ISO 17100:2015 certified, embassy-accepted, express delivery available.',
      isActive: true,
    };
    await prisma.service.upsert({ where: { key }, update: data, create: { key, ...data } });
  }
  console.log(`   ✅ ${SERVICES.length} services`);
}

async function seedIndustries() {
  console.log(`⏳ ${INDUSTRIES.length} industries…`);
  for (const [i, ind] of INDUSTRIES.entries()) {
    await prisma.industry.upsert({
      where: { name: ind.name },
      update: { icon: ind.icon, desc: ind.desc, svc: ind.svc, isActive: true },
      create: { ...ind, isActive: true },
    });
    void i;
  }
  console.log(`   ✅ ${INDUSTRIES.length} industries`);
}

async function main() {
  console.log('📚 Seeding catalog…');
  await seedLanguages();
  await seedCities();
  await seedServices();
  await seedIndustries();
  console.log('🎉 Catalog seeded.');
}

main()
  .catch((e) => {
    console.error('❌ Catalog seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
