// Script to seed the language detail-template CMS section
// Run: node scripts/seed-lang-template.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const settings = {
  // Breadcrumb
  breadcrumbHome: 'Home',
  breadcrumbLanguages: 'Languages',
  breadcrumbLabel: '{flag} {language} Translation Services',

  // Hero
  heroFlag: '{flag} {language} Translation Services',
  heroTitle: '{language} Translation<br>Services in <em>{city}</em>',
  heroSub: 'Professional, ISO-certified {language}↔English/Hindi translation services across {city}. Accepted by embassies, MEA, courts and government authorities. Serving India since 2005.',
  heroQuoteBtn: '📋 Get Free Quote',
  heroCallBtn: '📞 Call Now',
  heroWhatsappBtn: '💬 WhatsApp',
  heroTrustBadges: '<div class="htrust"><span class="htrust-icon">✅</span> Embassy Accepted</div>\n<div class="htrust"><span class="htrust-icon">⚡</span> 24-Hr Express</div>\n<div class="htrust"><span class="htrust-icon">🔏</span> Notarized &amp; Apostilled</div>\n<div class="htrust"><span class="htrust-icon">🏆</span> ISO-9001:2015 and ISO 17100:2015</div>\n<div class="htrust"><span class="htrust-icon">⭐</span> 4.9/5 · 10,000+ Reviews</div>',

  // 1. Intro Section
  introTitle: '{language} Translation Services in {city}',
  introP1: 'Language Guru is a leading certified {language} translation agency, offering professional {language}↔English/Hindi translation services since 2005. ISO-9001:2015 and ISO 17100:2015 certified, MSME registered, government-authorized — translations accepted by all embassies, MEA and courts.',
  introP2: 'Our {language} translators are native speakers and domain experts across legal, medical, technical, academic and immigration fields. All translations on official letterhead with notarization, Certificate of Accuracy and ISO stamp — embassy-ready on first submission.',
  introP3: 'From birth certificates to large corporate translation projects, we deliver accurate {language} translations on time. 24-hour express delivery available across India. Office submission or email / WhatsApp in Delhi NCR.',

  // 2. Legal Section
  legalTitle: 'Legal {language} Translation Services in {city}',
  legalP1: "Language Guru is one of India's most trusted providers of legal {language} translation services. Our legal {language} translators are qualified professionals with deep expertise in Indian and international law, court procedures, contract law, immigration regulations and corporate compliance. Every legal {language} translation is done by a native {language}-speaking legal specialist and reviewed by a second expert before delivery.",
  legalP2: 'We provide court-certified and embassy-accepted legal {language} translations for all types of legal documents – from court orders and judgments to contracts, affidavits, power of attorney, partnership deeds, MOA/AOA, and property papers. Our translations are accepted by all district courts, high courts, the Supreme Court of India, MEA (Ministry of External Affairs), and 60+ embassies in New Delhi including the German Embassy, French Embassy and US Embassy.',
  legalP3: 'For legal professionals, law firms, corporate legal departments and individuals needing court-ready {language} translation across India, Language Guru delivers with precision, confidentiality and legal accuracy. We work under strict Non-Disclosure Agreements and comply with ISO-9001:2015 and ISO 17100:2015 standards.',
  legalCard1Icon: '⚖️', legalCard1Title: 'Court Documents', legalCard1Desc: 'Orders, judgments, decrees, summons',
  legalCard2Icon: '🔐', legalCard2Title: 'Contracts & Agreements', legalCard2Desc: 'Business contracts, MOU, partnership deed',
  legalCard3Icon: '🏠', legalCard3Title: 'Property Documents', legalCard3Desc: 'Sale deed, gift deed, mortgage docs',
  legalCard4Icon: '📝', legalCard4Title: 'Affidavits & POA', legalCard4Desc: 'Sworn statements, power of attorney',
  legalCard5Icon: '🏢', legalCard5Title: 'Corporate Legal', legalCard5Desc: 'MOA/AOA, board resolutions, filings',
  legalCard6Icon: '🛡️', legalCard6Title: 'NDA & IP Documents', legalCard6Desc: 'Patents, trademarks, confidentiality agreements',
  legalAcceptedTitle: 'Accepted by all Courts & Embassies',
  legalAcceptedText: 'Delhi High Court · Supreme Court · All District Courts · MEA New Delhi · German Embassy · French Embassy · US Embassy · 60+ Embassies in New Delhi',

  // 3. Official Section
  officialTitle: 'Official {language} Translation Services in {city}',
  officialP1: "Language Guru provides official {language} translation services accepted by all government bodies, regulatory authorities, embassies and public institutions in India and abroad. Our official {language} translations carry the full credentials required by government bodies: official company letterhead, certified translator's signature, registration number, contact details, and a sworn statement of accuracy – making them immediately valid for submission to any government department, court, embassy or university.",
  officialP2: 'Official {language} translation is required for a wide range of purposes: visa and immigration applications, MEA apostille and embassy attestation, court and tribunal submissions, university admissions abroad, government tenders and procurement, and all public notarial acts. Language Guru – MSME registered, ISO-9001:2015 and ISO 17100:2015 certified and operating since 2005 – is one of the few agencies in India authorized to issue officially certified translations accepted by all Indian and foreign government bodies.',
  officialP3: 'We offer official {language} translations with turnaround as fast as 24 hours, with easy document submission via email / WhatsApp across India and secure courier delivery anywhere in India. All translations include digital (soft copy PDF/Word) and physical (hard copy with stamps) delivery options.',
  officialPillar1Icon: '🏛️', officialPillar1Title: 'Government & Ministry', officialPillar1Desc: 'Ministry submissions, government tenders, PSU documents, official records translation for all central and state government bodies',
  officialPillar2Icon: '🛂', officialPillar2Title: 'Embassy & Consulate', officialPillar2Desc: 'All 60+ embassies in New Delhi, consular submissions, visa applications, PR and work permit documentation',
  officialPillar3Icon: '🎓', officialPillar3Title: 'University & Academic', officialPillar3Desc: 'Foreign university admissions, WES evaluation, DDV for Germany, ENIC/NARIC, NACES member organizations',
  officialPillar4Icon: '🔏', officialPillar4Title: 'MEA Apostille Ready', officialPillar4Desc: 'End-to-end apostille service – translation + notarization + MEA apostille sticker, valid in all 125 Hague Convention countries',

  // 4. Certified Section
  certifiedTitle: 'Certified {language} Translation Services in {city}',
  certifiedP1: "Language Guru delivers ISO-9001:2015 and ISO 17100:2015 certified {language} translation services across India. A certified {language} translation from Language Guru includes: translation on official agency letterhead, certified translator's full name, qualification, signature and stamp, a formal statement of accuracy and completeness, and the agency's MSME registration and ISO certification details. This complete package is the standard required by all embassies, courts, MEA and government departments in India and internationally.",
  certifiedP2: 'Our certified {language} translations are prepared exclusively by native {language} speakers holding recognized translation qualifications (B.A./M.A. in Translation, DipTrans, or equivalent) with minimum 5 years of domain-specific experience. Every certified {language} translation undergoes a mandatory 3-stage quality check: initial translation by a domain expert, independent review by a second {language} specialist, and final certification by our Quality Manager. This process ensures 100% accuracy and first-submission acceptance at all embassies and government offices.',
  certifiedP3: 'Whether you need a single certified {language} document or a bulk project of 100+ pages anywhere in India, Language Guru offers consistent quality, ISO-standard processes and competitive pricing starting at ₹850/page for certified translations with full letterhead, Certificate of Accuracy and quality certification. Express 24-hour certified {language} translation is available for urgent requirements.',
  priceStandardVal: '₹600',
  priceStandardUnit: 'per page',
  priceStandardLabel: 'Standard',
  priceStandardTime: '5–7 working days',
  priceCertifiedVal: '₹850',
  priceCertifiedUnit: 'per page',
  priceCertifiedLabel: 'Certified',
  priceCertifiedTime: '3–5 working days',
  priceExpressVal: '₹1,275',
  priceExpressUnit: 'per page',
  priceExpressLabel: 'Express',
  priceExpressTime: '24 hours',
  certifiedIncludesTitle: 'Every Certified {language} Translation Includes:',
  certInc1: 'Translation on official letterhead',
  certInc2: 'Certified Agency Sign & Stamp & stamp',
  certInc3: 'Sworn affidavit & statement of accuracy',
  certInc4: 'ISO-9001:2015 and ISO 17100:2015 quality certification',
  certInc5: 'Embassy-ready format (all 60+ embassies)',
  certInc6: 'Soft copy PDF + hard copy on request',

  // 5. Agency Section
  agencyTitle: '{language} Translation Agency in {city}',
  agencyP1: 'Language Guru is a leading ISO-9001:2015 and ISO 17100:2015 certified {language} translation agency in {city}. Our network of 200+ sworn {language} translators has delivered 20,000+ certified projects accepted by all embassies, MEA, courts, and universities. We accept documents via office visit (Delhi), email or WhatsApp, offer 24-hour express delivery, and complete confidentiality under NDA-backed protocols across all cities in India.',
  agencyP2: 'Our {language} translators hold recognized qualifications from top European and Indian universities, with certification from the respective language institutes. Language Guru serves individuals, law firms, hospitals, MNCs, and government departments in {city} with transparent pricing starting from ₹600/page.',
  agencyBadge1Icon: '🏛️', agencyBadge1Title: 'ISO Certified', agencyBadge1Desc: '9001:2015 · 17100:2015',
  agencyBadge2Icon: '⭐', agencyBadge2Title: '4.9/5 Rating', agencyBadge2Desc: '2,800+ client reviews',
  agencyBadge3Icon: '⚡', agencyBadge3Title: '24-Hr Express', agencyBadge3Desc: 'Urgent {language} in 24 hrs',

  // 6. Documents Section
  docsTitle: '{language} Documents We Translate',
  docsSubtitle: 'Language Guru handles 100+ {language} document types for individuals, corporates, law firms, hospitals, embassies and government agencies across India. Browse by category:',
  docTabAllLabel: '📋 All',

  // 7. Interpretation Section
  interpTitle: 'Professional {language} Interpreters in {city}',
  interpP1: 'Language Guru – Language Guru provides certified {language} interpretation services across India. Our professional {language} interpreters are qualified, native-speaking language specialists with domain expertise in legal, medical, corporate and conference settings. We offer both on-site and remote interpretation in {language}↔English and {language}↔Hindi language pairs, covered under our ISO-9001:2015 and ISO 17100:2015 quality framework with strict NDA protection.',
  interpP2: 'Our {language} interpreters serve clients across all major Indian cities for court hearings, business negotiations, medical consultations, embassy appointments, trade fairs and international conferences. With 20+ years of experience, Language Guru is the preferred {language} interpretation partner for government bodies, law firms, hospitals, embassies and Fortune 500 companies across India.',
  interpP3: 'Whether you need a consecutive interpreter for a one-on-one meeting, a simultaneous interpreter for a large conference, or a telephone interpreter for a remote consultation — Language Guru has certified {language} interpreters available for same-day bookings. Call or WhatsApp +91-9312690490 for instant booking.',
  interpBookBtn: '📋 Book {language} Interpreter →',
  interpWhatsappBtn: '💬 WhatsApp for Interpreter',

  // 8. Service Types Section
  servicesTitle: '{language} Translation Service Types',

  // 9. Pricing Section
  pricingTitle: '{language} Translation Pricing',
  pricingAddons: 'Transparent all-inclusive pricing with no hidden charges. All prices include translation on official letterhead.',

  // 10. Samples Section
  certSampleTitle: '{language} Translation Certificate Samples',
  certSampleSubtitle: 'View sample translations to understand our quality. Click any sample for full details and download.',
  sampleGalleryBtn: 'View Full Gallery →',

  // 11. Why Choose Section
  whyChooseTitle: 'Why Choose Language Guru for {language} Translation?',

  // 12. Cities Section
  citySectionHeading: '{language} Translation Available Across India',
  citySectionSub: 'Language Guru provides certified {language} translation services in 150+ cities across India. Click your city for local pricing, office details, and document submission options:',

  // 13. Other Languages Section
  otherLangsHeading: 'Other Language Translation Services in {city}',
  otherLangsSub: 'In addition to {language} translation, Language Guru provides certified translation services in 120+ languages. Click any language below for dedicated pricing, certificate samples and city coverage:',

  // 14. Reviews Section
  reviewsTitle: 'Verified Client Reviews for {language} Translation',

  // 15. FAQs Section
  faqsTitle: '❓ {language} Translation — Frequently Asked Questions',
  faqSub: 'Common questions about {language} translation and interpretation services in {city}.',

  // CTA Banner
  ctaTitle: 'Ready to Get Your {language} Translation in {city}?',
  ctaSubtitle: 'Upload your documents now for a certified quote in 30 minutes. 100% embassy accepted.',
  ctaQuoteBtn: '📋 Get Free Quote',

  // Sidebar
  sidebarCtaTitle: '📞 {language} Translation Help',
  expertQuoteText: 'Expert in {language} — instant quote in 30 minutes',
  sidebarQuoteBtn: '📋 Get Free Quote',
  sidebarWhatsappBtn: '💬 WhatsApp Us',
  sbCityTitle: '🗺️ {language} Translation – By City',
  sbOtherLangTitle: '🌍 Other Languages – {city}',
  sbOtherSvcTitle: '📋 Other Translation Services – {city}',
  sbPricingTitle: '💰 {language} Translation Pricing'
};

async function run() {
  console.log('Seeding language detail-template section...');

  await prisma.pageSection.upsert({
    where: { pageKey_sectionKey: { pageKey: 'languages', sectionKey: 'detail-template' } },
    update: { settings, isActive: true },
    create: {
      pageKey: 'languages',
      sectionKey: 'detail-template',
      kind: 'template',
      heading: 'Language Detail Template',
      body: 'CMS template for all language detail pages. Uses {language}, {flag}, {city} placeholders.',
      settings,
      sortOrder: 1,
      isActive: true,
    },
  });

  console.log('✅ Language detail-template seeded successfully!');
}

run()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
