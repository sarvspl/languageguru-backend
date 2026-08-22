// Script to seed the language detail-template CMS section
// Run: node scripts/seed-lang-template.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = {
    // Breadcrumb
    breadcrumbHome: 'Home',
    breadcrumbLanguages: 'Languages',
    breadcrumbLabel: '{language} Translation',

    // Hero
    heroFlag: '{flag}',
    heroTitle: '{language} Translation Services in {city}',
    heroSub: 'ISO-9001:2015 & ISO 17100:2015 Certified {language} Translation for all documents — Embassies, Courts, MEA, Universities & Corporates.',
    heroQuoteBtn: '📋 Get Free Quote',
    heroCallBtn: '📞 Call Now',
    heroWhatsappBtn: '💬 WhatsApp',
    heroTrustBadges: '<div class="htrust"><span class="htrust-icon">🛡️</span> Embassy Accepted</div>\n<div class="htrust"><span class="htrust-icon">⚡</span> 24-Hr Express</div>\n<div class="htrust"><span class="htrust-icon">🏛️</span> MSME Registered</div>\n<div class="htrust"><span class="htrust-icon">✅</span> ISO 17100</div>\n<div class="htrust"><span class="htrust-icon">⭐</span> 4.9/5 · 10,000+ Reviews</div>',

    // Intro Section
    introTitle: 'Certified {language} Translation Services in India',
    introP1: 'Language Guru provides ISO-9001:2015 and ISO 17100:2015 certified {language} translation services across India. Our native {language}-speaking translators deliver government-authorized certified translations accepted by all embassies, courts, MEA, NAATI, and government departments.',
    introP2: 'We offer comprehensive {language} translation for legal, academic, immigration, medical, commercial, and technical documents. Express 24-hour delivery available for all document types.',
    introP3: 'All {language} translations come with our official certified stamp, translator certificate of accuracy, and are embassy-ready. Pan-India delivery via courier available.',

    // Legal Section
    legalTitle: '{language} Legal & Official Translation',
    legalP1: 'Our {language} certified translators are native speakers with expertise in legal, corporate, and government terminology. All translations are prepared and signed by qualified professionals.',
    legalCard1Icon: '🏛️', legalCard1Title: 'Embassy Accepted', legalCard1Desc: 'Accepted by all 60+ embassies in India',
    legalCard2Icon: '⚖️', legalCard2Title: 'Court Certified', legalCard2Desc: 'Accepted by High Courts & District Courts',
    legalCard3Icon: '📋', legalCard3Title: 'MEA Apostille', legalCard3Desc: 'Ministry of External Affairs apostille',
    legalCard4Icon: '🎓', legalCard4Title: 'University Ready', legalCard4Desc: 'Accepted by all Indian & foreign universities',
    legalCard5Icon: '🏥', legalCard5Title: 'Medical Docs', legalCard5Desc: 'Medical reports & health certificates',
    legalCard6Icon: '💼', legalCard6Title: 'Corporate Use', legalCard6Desc: 'Contracts, agreements, business docs',
    legalAcceptedTitle: '✅ 100% Acceptance Guarantee',
    legalAcceptedText: 'Every {language} translation we deliver is accepted by the requesting authority — guaranteed. If rejected for translation quality, we redo it for free.',

    // Official Section
    officialTitle: 'Official {language} Translation Process',
    officialP1: 'Our quality-assured process ensures every {language} translation meets international standards and is accepted without rejection.',
    officialPillar1Icon: '📝', officialPillar1Title: 'Document Review', officialPillar1Desc: 'Expert review of source document for completeness and clarity',
    officialPillar2Icon: '🔤', officialPillar2Title: 'Native Translation', officialPillar2Desc: 'Translation by native {language} speakers with domain expertise',
    officialPillar3Icon: '✅', officialPillar3Title: 'Quality Check', officialPillar3Desc: 'Independent proofreading and terminology verification',
    officialPillar4Icon: '🏛️', officialPillar4Title: 'Certification', officialPillar4Desc: 'Official stamp and certificate of accuracy by authorized translator',

    // Certified Section
    certifiedTitle: '{language} Translation Pricing',
    certifiedP1: 'Transparent, fixed pricing for all {language} translation services. No hidden charges. GST invoice provided.',
    priceStandardVal: '₹449',
    priceStandardUnit: '/page',
    priceStandardLabel: 'Simple Translation',
    priceStandardTime: '5–7 working days',
    priceCertifiedVal: '₹899',
    priceCertifiedUnit: '/page',
    priceCertifiedLabel: 'Certified Translation',
    priceCertifiedTime: '2–3 working days',
    priceExpressVal: '₹1,349',
    priceExpressUnit: '/page',
    priceExpressLabel: 'Express 24H',
    priceExpressTime: '24 hours',
    certifiedIncludesTitle: 'Every Certified {language} Translation Includes:',
    certInc1: 'Certified stamp & translator signature',
    certInc2: 'Certificate of accuracy',
    certInc3: 'Letterhead on official paper',
    certInc4: 'Embassy & court ready',
    certInc5: 'GST invoice',
    certInc6: 'Free revision if rejected',
    certInc7: 'Scanned + hard copy available',
    certInc8: 'NDA confidentiality assured',

    // Agency Section
    agencyTitle: 'Why Language Guru for {language} Translation?',
    agencyP1: 'With 20+ years of experience, Language Guru is India\'s most trusted {language} translation agency. ISO-certified, MSME-registered, and government-authorized.',
    agencyBadge1Icon: '🏅', agencyBadge1Title: 'ISO 9001:2015', agencyBadge1Desc: 'Quality certified',
    agencyBadge2Icon: '🌐', agencyBadge2Title: 'ISO 17100:2015', agencyBadge2Desc: 'Translation standard',
    agencyBadge3Icon: '🏛️', agencyBadge3Title: 'MSME Registered', agencyBadge3Desc: 'Govt. of India',

    // Documents Section
    docsTitle: 'Documents We Translate in {language}',
    docsSubtitle: 'Complete {language} translation service for all document types',
    docTabAllLabel: '📋 All Documents',

    docCat1Icon: '🎓', docCat1Name: 'Academic',
    docCat1Items: 'Degree Certificate\nMarksheet / Transcript\nMigration Certificate\nBonafide Certificate\nSchool Leaving Certificate\nProvisional Certificate\nNOC from University\nDiploma Certificate',

    docCat2Icon: '⚖️', docCat2Name: 'Legal',
    docCat2Items: 'Affidavit\nPower of Attorney\nCourt Order / Decree\nLegal Notice\nMOU / Agreement\nPartnership Deed\nCompany Registration\nApostille Documents',

    docCat3Icon: '✈️', docCat3Name: 'Immigration & Visa',
    docCat3Items: 'Birth Certificate\nMarriage Certificate\nDivorce Certificate\nDeath Certificate\nPassport Copy\nPAN Card\nAadhaar Card\nVisa Application Documents',

    docCat4Icon: '🏥', docCat4Name: 'Medical',
    docCat4Items: 'Medical Reports\nDischarge Summary\nPrescriptions\nPathology Reports\nMedical Certificate\nVaccination Records\nDental Records\nPsychiatric Reports',

    docCat5Icon: '💼', docCat5Name: 'Financial',
    docCat5Items: 'Bank Statements\nAudit Reports\nBalance Sheet\nIncome Tax Returns\nSalary Slips\nEmployment Letter\nProfit & Loss Statement\nInvestment Documents',

    docCat6Icon: '⚙️', docCat6Name: 'Technical',
    docCat6Items: 'Technical Manuals\nPatent Documents\nProduct Catalogues\nUser Guides\nEngineering Drawings\nSoftware Documentation\nSafety Data Sheets\nISO Compliance Documents',

    // Interpretation Section
    interpTitle: '{language} Interpretation Services',
    interpP1: 'Professional {language} interpretation services for business meetings, court hearings, medical appointments, conferences, and events across India.',
    interpCard1Icon: '🏢', interpCard1Title: 'Business Meetings', interpCard1Desc: 'Corporate negotiations & presentations',
    interpCard2Icon: '⚖️', interpCard2Title: 'Court Hearings', interpCard2Desc: 'Legal proceedings & depositions',
    interpCard3Icon: '🏥', interpCard3Title: 'Medical', interpCard3Desc: 'Doctor consultations & clinical trials',
    interpCard4Icon: '🎤', interpCard4Title: 'Conferences', interpCard4Desc: 'Simultaneous & consecutive interpretation',
    interpCard5Icon: '🎓', interpCard5Title: 'Academic', interpCard5Desc: 'University events & seminars',
    interpCard6Icon: '📞', interpCard6Title: 'Phone / Video', interpCard6Desc: 'Remote interpretation services',
    interpBookBtn: '📞 Book {language} Interpreter',
    interpWhatsappBtn: '💬 WhatsApp for Interpretation',

    // Service Types
    svcTypesTitle: '{language} Translation Service Types',
    svcType1Icon: '📜', svcType1Title: 'Certified Translation', svcType1Desc: 'Official certified translations for embassies, courts and government authorities.', svcType1Link: 'View Certified Translation →',
    svcType2Icon: '⚖️', svcType2Title: 'Legal Translation', svcType2Desc: 'Contracts, affidavits, court orders and legal documents.', svcType2Link: 'View Legal Translation →',
    svcType3Icon: '⚙️', svcType3Title: 'Technical Translation', svcType3Desc: 'Manuals, engineering documents and technical specifications.', svcType3Link: 'View Technical Translation →',
    svcType4Icon: '🎓', svcType4Title: 'Academic Translation', svcType4Desc: 'Degree certificates, transcripts and educational documents.', svcType4Link: 'View Academic Translation →',
    svcType5Icon: '✈️', svcType5Title: 'Visa Translation', svcType5Desc: 'All documents required for visa and immigration applications.', svcType5Link: 'View Visa Translation →',
    svcType6Icon: '🔏', svcType6Title: 'Apostille Translation', svcType6Desc: 'MEA apostille with certified translation in one order.', svcType6Link: 'View Apostille Services →',

    // Pricing Table
    pricingTableTitle: '{language} Translation Rates & Pricing',
    pricingTableSub: 'Transparent fixed pricing. No hidden charges. GST invoice included with every order.',
    pricingColService: 'Service Type',
    pricingColPrice: 'Price',
    pricingColDelivery: 'Delivery',
    pricingColIncludes: 'What\'s Included',
    pricingStandardLabel: 'Simple Translation',
    pricingStandardRate: '₹449/page',
    pricingStandardDelivery: '5–7 days',
    pricingStandardIncludes: 'Company Sign & Seal · Letterhead · Soft Copy PDF',
    pricingCertifiedLabel: 'Certified Translation',
    pricingCertifiedBadge: '⭐ POPULAR',
    pricingCertifiedRate: '₹899/page',
    pricingCertifiedDelivery: '3–5 days',
    pricingCertifiedIncludes: 'Letterhead + Certificate of Accuracy',
    pricingExpressLabel: 'Express 24H',
    pricingExpressRate: '₹1,349/page',
    pricingExpressDelivery: '24 hours',
    pricingExpressIncludes: 'Certified + Priority',
    pricingNotaryLabel: 'Notary Seal',
    pricingNotaryRate: '₹200/page',
    pricingNotaryDelivery: '2–3 days',
    pricingNotaryIncludes: 'Notary seal',
    pricingApostilleLabel: 'Apostille Sticker',
    pricingApostilleRate: '₹1,400/page',
    pricingApostilleDelivery: '2 working days',
    pricingApostilleIncludes: 'Apostille sticker',

    // Certificate Samples
    sampleTitle: '{language} Translation Certificate Samples',
    sampleSubtitle: 'Preview our certified {language} translation format accepted by all embassies and courts in India.',
    sampleGalleryBtn: '🖼️ View All Samples →',

    // Why Choose
    whyChooseTitle: 'Why Choose Language Guru for {language} Translation?',
    whyChooseBullets:
      'Native {language} Translators|Native-speaking translators with domain expertise in legal, medical and technical fields.\n' +
      'Embassy-Assisted|Certified translations accepted by all embassies and government offices without re-certification.\n' +
      'ISO-9001:2015 and ISO 17100:2015 Certified|Quality management system certified by leading international bodies.\n' +
      'MSME Registered Government-Authorized|Legally authorized for all government offices and courts in India.\n' +
      'Express 24-Hour Service|Urgent translation with same-day office submission in Delhi and express pan-India delivery.\n' +
      'End-to-End Services|Translation + notarization + MEA apostille + embassy attestation under one roof.\n' +
      'Document Submission & Delivery|Office / email / WhatsApp submission in Delhi NCR; pan-India courier for all cities.',

    // Cities Section
    citiesTitle: '{language} Translation Services in Other Cities',
    citiesIntro: 'We deliver certified {language} translation across 150+ cities in India.',

    // Other Languages
    otherLangTitle: 'Other Language Translation Services',
    otherLangIntro: 'We also offer certified translation services for 120+ other languages.',

    // CTA Banner
    ctaTitle: 'Get {language} Translation in 24 Hours',
    ctaText: 'ISO-certified {language} translation accepted by all embassies, courts, and government offices across India.',
    ctaQuoteBtn: '📋 Get Free Quote',
    ctaCallBtn: '📞 Call Now',

    // Sidebar
    sidebarCtaIcon: '🌐',
    sidebarCtaTitle: '{language} Translation Help',
    expertQuoteText: 'Expert in {language} — Instant quote in 30 minutes',
    sidebarPhone1: '+91-9312690490',
    sidebarPhone2: '+91-9810655777',
    sidebarQuoteBtn: '📋 Get Free Quote',
    sidebarWhatsappBtn: '💬 WhatsApp Consultation',
    sbCitiesTitle: '🏙️ Cities We Serve',
    sbCityItemLabel: '{language} in {item}',
    sbAllCitiesLink: 'View All Cities →',
    sbOtherLangTitle: '🌍 Other Languages',
    sbOtherLangItem: '{item}',
    sbOtherSvcTitle: '📋 Our Services',
    sbOtherSvcItem: '{item}',
    sbPricingTitle: '💰 Pricing',
    sbPriceEconomyLabel: 'Simple',
    sbPriceCertifiedLabel: 'Certified',
    sbPriceExpressLabel: 'Express 24H',
    sbPriceNotaryLabel: 'Notary',
    sbPriceApostilleLabel: 'Apostille',
    sbPriceUnit: '/page',
    sbGetQuoteBtn: '📋 Get Quote →',
    sbCertTitle: '🏆 Certifications',
    sbCertBadge1: '🏅 MSME Reg.',
    sbCertBadge2: '✅ ISO 9001',
    sbCertBadge3: '🌐 ISO 17100',
    sbCertBadge4: '🏛️ MEA Cert.',
    sbCertRatingText: '⭐ 4.9/5 · 10,000+ Reviews',

    // Currency / Units
    currencySymbol: '₹',
    defaultRegion: 'India',
    defaultCity: 'Delhi',
  };

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

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
