/**
 * CONTENT SEED — every page, every section, every list.
 *
 * This file is the single source for the copy that used to be hardcoded in the
 * React components and in lib/legacy-interactivity.js. Each page gets a SitePage
 * row (with an admin-editable slug) and one PageSection row per band. Repeatable
 * content — card grids, process steps, comparison rows, FAQ pairs, dropdown
 * option lists — lives in `PageSection.items` so new section shapes never need a
 * schema change.
 *
 * Idempotent: every write is an upsert. Re-running refreshes seeded copy and
 * leaves admin-created rows alone.
 */
// Load .env explicitly rather than relying on Prisma doing it as a side effect.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SectionSeed = {
  sectionKey: string;
  kind: string;
  tag?: string;
  heading?: string;
  subheading?: string;
  body?: string;
  layout?: string;
  buttonText?: string;
  buttonLink?: string;
  button2Text?: string;
  button2Link?: string;
  items?: unknown;
  settings?: unknown;
};

type PageSeed = {
  key: string;
  slug: string;
  title: string;
  navLabel?: string;
  heroTag?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  metaTitle?: string;
  metaDesc?: string;
  showInNav?: boolean;
  showInFooter?: boolean;
  showInSitemap?: boolean;
  sortOrder: number;
  sections: SectionSeed[];
};

// ═══════════════════════════════════════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════════════════════════════════════
const HOME: PageSeed = {
  key: 'home',
  slug: '',
  title: 'Home',
  navLabel: 'Home',
  heroTitle: 'Professional Translation Services in India',
  heroSubtitle:
    'Certified & Court-Accepted translations in 120+ languages. 500+ expert translators. 20 years of excellence — embassy-accepted, government-authorized, ISO-9001:2015 and ISO 17100:2015 certified.',
  heroTag: "India's Most Trusted Translation Agency",
  metaTitle: 'Language Guru — Certified Translation Agency in India',
  metaDesc:
    'ISO-9001:2015 & ISO 17100:2015 certified translation and interpretation services in 120+ languages across 150+ Indian cities.',
  showInNav: true,
  showInFooter: true,
  sortOrder: 10,
  sections: [
    {
      sectionKey: 'hero-badges',
      kind: 'options',
      heading: 'Hero trust badges',
      items: [
        { label: '🛡️ ISO-9001:2015 and ISO 17100:2015' },
        { label: '📑 MSME Registered' },
        { label: '🏛️ MEA Empanelled' },
        { label: '⭐ 4.9 Rating' },
      ],
      settings: { badge: '⭐ ISO-9001:2015 and ISO 17100:2015 Certified Translation Agency' },
    },
    {
      sectionKey: 'stats',
      kind: 'stats',
      heading: 'Headline statistics',
      items: [
        { value: '120+', label: 'Languages' },
        { value: '10,000+', label: 'Happy Clients' },
        { value: '20+', label: 'Years Experience' },
        { value: '150+', label: 'Indian Cities' },
      ],
    },
    {
      sectionKey: 'ticker',
      kind: 'options',
      heading: 'Scrolling ticker',
      items: [
        { label: '🏛️ Embassy Accepted' },
        { label: '⚖️ Court Admissible' },
        { label: '🎓 University Approved' },
        { label: '🔏 MEA Apostille' },
        { label: '⚡ 24-Hour Express' },
        { label: '🔒 NDA Protected' },
        { label: '🌍 120+ Languages' },
        { label: '📍 150+ Cities' },
      ],
    },
    {
      sectionKey: 'services',
      kind: 'grid',
      tag: 'Our Services',
      heading: 'Official <em>Translation Services</em>',
      subheading: 'Click any service to see full details',
      buttonText: 'View All Services →',
      buttonLink: '/services',
      settings: { source: 'services', limit: 8, sidebarHeading: '📋 All Services' },
    },
    {
      sectionKey: 'industries',
      kind: 'grid',
      tag: 'Industries We Serve',
      heading: 'Specialized Translation <em>Across Industries</em>',
      subheading:
        'Certified translation by domain specialists across legal, medical, technical, academic, finance and government sectors.',
      buttonText: 'All Services →',
      buttonLink: '/services',
      settings: { source: 'industries' },
    },
    {
      sectionKey: 'languages',
      kind: 'grid',
      tag: 'At Language Guru',
      heading: 'Languages <em>We Cover</em>',
      subheading:
        'Certified translation in 120+ languages by native-speaking ISO-certified translators — click any language to get started.',
      buttonText: 'View All →',
      buttonLink: '/languages',
      settings: { source: 'languages', groupBy: 'cat', perGroup: 8 },
    },
    {
      sectionKey: 'cities',
      kind: 'grid',
      tag: 'Pan-India Presence',
      heading: 'Translation Services <em>Across India</em>',
      subheading:
        'ISO-certified translation across 150+ Indian cities — office / email / WhatsApp submission in Delhi NCR, courier delivery nationwide.',
      buttonText: 'All Cities →',
      buttonLink: '/cities',
      settings: { source: 'cities', limit: 11 },
    },
    {
      sectionKey: 'gallery',
      kind: 'grid',
      tag: 'Our Portfolio',
      heading: 'Certificate <em>Sample Gallery</em>',
      subheading: 'Browse professionally translated and certified documents accepted by embassies worldwide',
      buttonText: 'View Full Gallery →',
      buttonLink: '/gallery',
      settings: { source: 'gallery' },
    },
    {
      sectionKey: 'why-choose',
      kind: 'cards',
      tag: 'Why Choose Us',
      heading: 'Why Choose Language Guru for <em>Certified Translation</em>',
      subheading:
        'ISO-9001:2015 and ISO 17100:2015 certified · MSME registered · MEA-empanelled · 10,000+ clients · Embassy-accepted translations guaranteed.',
      settings: { source: 'whyChoose' },
    },
    {
      sectionKey: 'quote',
      kind: 'form',
      tag: 'Free Quote',
      heading: 'Get a Free <em>Translation Quote</em>',
      subheading: 'Quick query · Response within 30 minutes · Embassy-accepted translations',
      buttonText: '📩 Send Query',
      body:
        '✓ We respond within 30 minutes (Mon–Sat, 9am–7pm) · ✓ 100% confidential<br>*Indicative rates only; final charges may vary by language pair, document type, complexity & number of pages.',
    },
    {
      sectionKey: 'testimonials',
      kind: 'cards',
      tag: 'Client Reviews',
      heading: 'What Our <em>Clients Say</em>',
      subheading: '⭐ 4.9/5 · Trusted by 10,000+ clients since 2005',
      settings: { source: 'testimonials' },
    },
    {
      sectionKey: 'faq',
      kind: 'faq',
      tag: 'FAQ',
      heading: 'Frequently Asked <em>Questions</em>',
      subheading: 'Common questions on pricing, delivery, apostille and embassy acceptance.',
      settings: { source: 'faqs', category: 'General', limit: 8 },
    },
    {
      sectionKey: 'clients',
      kind: 'grid',
      tag: 'Trusted By',
      heading: 'Our Clients &amp; Partners',
      settings: { source: 'clients' },
    },
    {
      sectionKey: 'cta',
      kind: 'cta',
      tag: 'Ready to Get Started?',
      heading: 'Get Your Documents Translated <em>Today</em>',
      subheading: 'Free instant quote · 24-hour express delivery · Embassy-accepted translations in 120+ languages',
      buttonText: '📋 Get Free Quote',
      buttonLink: '/quote',
      button2Text: '💬 WhatsApp Us',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════════════════════
const SERVICES: PageSeed = {
  key: 'services',
  slug: 'services',
  title: 'All Translation Services',
  navLabel: 'Services',
  heroTitle: 'All Translation Services',
  heroSubtitle:
    'Professional translation and language services — certified, legal, apostille, interpretation and more',
  metaTitle: 'All Translation Services in Delhi | Language Guru',
  metaDesc:
    'Certified, legal, medical, technical, business, apostille and interpretation services in 120+ languages. ISO certified, embassy accepted.',
  showInNav: true,
  showInFooter: true,
  sortOrder: 20,
  sections: [
    {
      sectionKey: 'grid',
      kind: 'grid',
      heading: 'Our services',
      settings: { source: 'services', priceLabelPrefix: 'From', linkLabel: 'View Details →' },
    },
    {
      sectionKey: 'stats',
      kind: 'stats',
      heading: 'Service statistics',
      items: [
        { value: '50K', suffix: '+', label: 'DOCUMENTS CERTIFIED' },
        { value: '120', suffix: '+', label: 'LANGUAGE PAIRS' },
        { value: '12', suffix: '', label: 'SERVICE LINES' },
        { value: '4.9', suffix: '★', label: '2,847 REVIEWS' },
        { value: '24', suffix: 'h', label: 'RUSH DELIVERY' },
      ],
    },
    {
      sectionKey: 'choose',
      kind: 'table',
      heading: 'How to Choose the Right Service',
      subheading:
        'Not sure which translation service you need? Match your document and purpose to the right service below.',
      settings: {
        columns: ['Your Purpose', 'Recommended Service', 'Why', 'Starting Price'],
      },
      items: [
        { purpose: 'Visa / Immigration', svc: 'Certified + Apostille', why: 'Embassy-grade authentication required', price: '₹1,400/doc' },
        { purpose: 'Court / Legal', svc: 'Legal + Notarized', why: 'Court-admissible legal precision', price: '₹850/page' },
        { purpose: 'University / Study Abroad', svc: 'Certified Translation', why: 'University-accepted ISO certificate', price: '₹850/page' },
        { purpose: 'Business / Corporate', svc: 'Business Translation', why: 'Confidential, domain-expert handling', price: '₹850/page' },
        { purpose: 'Live Meeting / Event', svc: 'Interpretation Service', why: 'Real-time simultaneous / consecutive', price: '₹7,500/day' },
        { purpose: 'Website / Marketing', svc: 'Localization Service', why: 'Cultural adaptation, not just translation', price: '₹850/page' },
        { purpose: 'Audio / Video', svc: 'Transcription & Subtitles', why: 'Time-coded, multilingual subtitle delivery', price: '₹49/min' },
      ],
    },
    {
      sectionKey: 'process',
      kind: 'steps',
      heading: 'How Our Translation Process Works',
      subheading: 'Same 5-step ISO 17100 quality flow across every service — from intake to certified delivery.',
      items: [
        { num: '01', title: 'Get a Quote', desc: 'Upload your document or describe the need. Free quote in 30 min.' },
        { num: '02', title: 'Project Match', desc: 'Assigned to a domain-expert translator + NDA signed.' },
        { num: '03', title: 'Translation', desc: 'Native-speaker certified translator handles your document.' },
        { num: '04', title: 'Quality Review', desc: 'Second translator reviews line-by-line. ISO 17100 standard.' },
        { num: '05', title: 'Certified Delivery', desc: 'Signed cert, notary stamp + courier or email same day.' },
      ],
    },
    {
      sectionKey: 'why-choose',
      kind: 'cards',
      heading: 'Why Choose Language Guru',
      subheading:
        'Government-authorized, embassy-accepted, ISO-certified — and trusted by 50,000+ clients across India since 2005.',
      items: [
        { icon: '🏛️', title: 'Government Authorized', desc: 'MSME-registered, ISO-9001:2015 and ISO 17100:2015 certified. Accepted by MEA, all courts, all embassies in Delhi.' },
        { icon: '✅', title: '100% Embassy Accepted', desc: 'German, French, US, UK, Canadian, Australian, UAE — 60+ embassies in New Delhi accept our certifications.' },
        { icon: '⚡', title: '24-Hour Rush Delivery', desc: 'Urgent translation in 24 hours for common language pairs. Weekend and same-day delivery available across Delhi NCR.' },
        { icon: '🌍', title: '120+ Languages', desc: 'Native-speaker translators for European, Asian, Middle Eastern, and all Indian regional languages.' },
        { icon: '🔒', title: '100% Confidential', desc: 'NDA-backed confidentiality on every project. Encrypted document handling. GDPR-compliant data practices.' },
        { icon: '🛡️', title: 'Money-Back Guarantee', desc: 'If your translation is rejected by an embassy or court, we revise it free — or refund 100%. Zero risk.' },
      ],
    },
    {
      sectionKey: 'faq',
      kind: 'faq',
      heading: 'Frequently Asked Questions',
      subheading: 'Common questions about our translation services.',
      settings: { source: 'faqs', category: 'Services' },
    },
    {
      sectionKey: 'cta',
      kind: 'cta',
      heading: 'Ready to Get Started?',
      subheading:
        'Upload your document for a free quote in 30 minutes. Rush delivery available. Submit at our Delhi office or via email / WhatsApp.',
      buttonText: '📋 Get Free Quote',
      buttonLink: '/quote',
      button2Text: '💬 WhatsApp Us',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// LANGUAGES
// ═══════════════════════════════════════════════════════════════════════════
const LANGUAGES: PageSeed = {
  key: 'languages',
  slug: 'languages',
  title: 'Languages We Translate',
  navLabel: 'Languages',
  heroTitle: 'Translation Services in Delhi<br>in <em>All Major Languages</em>',
  heroSubtitle:
    'Certified translations for embassies, courts, MEA, and government — covering European, Asian, Middle Eastern, African, and Indian languages. ISO-9001:2015 and ISO 17100:2015 certified. MEA empanelled.',
  metaTitle: 'Translation Services in 120+ Languages | Language Guru',
  metaDesc:
    'Certified translation across European, Asian, Middle Eastern, African and all Indian languages. Embassy and court accepted.',
  showInNav: true,
  showInFooter: true,
  sortOrder: 30,
  sections: [
    {
      sectionKey: 'stats',
      kind: 'stats',
      heading: 'Language statistics',
      items: [
        { value: '1 Lakh+', label: 'Docs Translated' },
        { value: '20 Years', label: 'Experience' },
        { value: '150+', label: 'Cities Served' },
        { value: '4.9★', label: 'Client Rating' },
      ],
      settings: { prependLanguageCount: true, languageCountLabel: 'Languages' },
    },
    {
      sectionKey: 'search',
      kind: 'options',
      heading: 'Search and filter',
      settings: {
        searchPlaceholder: '🔍 Search language e.g. German, Arabic, Tamil…',
        allLabel: 'All Categories',
        buttonText: 'Search',
      },
      items: [],
    },
    {
      sectionKey: 'categories',
      kind: 'cards',
      heading: 'Language categories',
      body: 'Category headings, icons and descriptions used to group the language grid.',
      items: [
        { cat: 'European', icon: '🌍', title: 'European Languages', desc: 'European Languages — from major languages like German, French, Spanish to rare Baltic and Slavic languages' },
        { cat: 'Asian', icon: '🌏', title: 'Asian Languages', desc: 'Asian Languages — Japanese, Chinese, Korean, Thai, Vietnamese, Indonesian and more' },
        { cat: 'Middle East', icon: '🕌', title: 'Middle East Languages', desc: 'Middle Eastern Languages — Arabic, Turkish, Hebrew, Persian, Pashto and Central Asian languages' },
        { cat: 'African', icon: '🌍', title: 'African Languages', desc: 'African & Oceanic Languages — Zulu, Somali, Twi, Fijian' },
        { cat: 'Indian', icon: '🇮🇳', title: 'Indian Languages', desc: 'Indian Languages — all official and regional Indian languages including all 22 scheduled languages' },
      ],
    },
    {
      sectionKey: 'cta',
      kind: 'cta',
      heading: "Don't See Your Language? We Can Help!",
      subheading: 'We offer translation in 120+ languages. Contact us for rare, tribal, and custom language pairs.',
      buttonText: '📋 Get Free Quote',
      buttonLink: '/quote',
      button2Text: '💬 WhatsApp',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// CITIES
// ═══════════════════════════════════════════════════════════════════════════
const CITIES: PageSeed = {
  key: 'cities',
  slug: 'cities',
  title: 'Cities We Serve',
  navLabel: 'Cities',
  heroTitle: 'Translation Services Across India',
  heroSubtitle:
    'Pan-India certified translation services with a physical office in Delhi NCR and digital delivery everywhere',
  metaTitle: 'Translation Services Across Indian Cities | Language Guru',
  metaDesc:
    'ISO-certified translation in 150+ Indian cities. Office submission in Delhi NCR, email / WhatsApp submission and courier delivery nationwide.',
  showInNav: true,
  showInFooter: true,
  sortOrder: 40,
  sections: [
    {
      sectionKey: 'regions',
      kind: 'cards',
      heading: 'Regional grouping',
      body: 'Controls how the city grid is grouped, and which state belongs to which region.',
      items: [
        { title: 'North India', icon: '🌆', color: 'var(--primary, #1a56a7)', states: ['Delhi', 'Haryana', 'Punjab', 'Himachal Pradesh', 'Jammu & Kashmir', 'Uttarakhand', 'Uttar Pradesh', 'Chandigarh'] },
        { title: 'West India', icon: '🏖️', color: 'var(--accent, #e8372a)', states: ['Maharashtra', 'Gujarat', 'Rajasthan', 'Goa'] },
        { title: 'South India', icon: '🌴', color: 'var(--green, #27ae60)', states: ['Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Puducherry'] },
        { title: 'East & Northeast India', icon: '🌅', color: 'var(--gold, #f5a623)', states: ['West Bengal', 'Odisha', 'Bihar', 'Jharkhand', 'Assam', 'Meghalaya', 'Manipur', 'Tripura'] },
        { title: 'Central India', icon: '🌿', color: '#8b5cf6', states: ['Madhya Pradesh', 'Chhattisgarh'] },
        { title: 'Other Regions', icon: '🌐', color: '#64748b', states: [] },
      ],
    },
    {
      sectionKey: 'coverage',
      kind: 'stats',
      heading: 'Pan-India coverage',
      items: [
        { value: '150+', label: 'CITIES COVERED' },
        { value: '28', label: 'STATES & UTs' },
        { value: '24h', label: 'EXPRESS DELIVERY' },
        { value: '100%', label: 'DIGITAL SUBMISSION' },
      ],
    },
    {
      sectionKey: 'how-it-works',
      kind: 'steps',
      heading: 'How Pan-India Service Works',
      subheading: 'The same certified output wherever you are — only the handover changes.',
      items: [
        { num: '01', title: 'Share Your Documents', desc: 'Email or WhatsApp scanned copies, or drop them at our Delhi NCR office.' },
        { num: '02', title: 'Approve the Quote', desc: 'Fixed per-page pricing, identical in every city. No location surcharge.' },
        { num: '03', title: 'Certified Translation', desc: 'Native-speaker translator plus an independent proofreader under ISO 17100.' },
        { num: '04', title: 'Delivery Anywhere', desc: 'Soft copy by email the same day; hard copies couriered to any PIN code.' },
      ],
    },
    {
      sectionKey: 'faq',
      kind: 'faq',
      heading: 'Pan-India FAQs',
      settings: { source: 'faqs', category: 'Cities' },
    },
    {
      sectionKey: 'cta',
      kind: 'cta',
      heading: 'Need Translation in Your City?',
      subheading: 'Flat pan-India pricing, express delivery and full embassy acceptance — wherever you are.',
      buttonText: '📋 Get Free Quote',
      buttonLink: '/quote',
      button2Text: '💬 WhatsApp',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// GALLERY · INDUSTRIES · TRANSLATORS
// ═══════════════════════════════════════════════════════════════════════════
const GALLERY: PageSeed = {
  key: 'gallery',
  slug: 'gallery',
  title: 'Certificate Gallery',
  navLabel: 'Gallery',
  heroTag: '🖼️ Sample Gallery',
  heroTitle: 'Certified Translation Certificate Gallery',
  heroSubtitle:
    'Browse professionally translated documents across languages, document types and countries. Every translation is ISO-certified and embassy-accepted.',
  metaTitle: 'Certified Translation Sample Gallery | Language Guru',
  metaDesc: 'Sample certified translations accepted by embassies, courts and universities worldwide.',
  showInNav: true,
  showInFooter: true,
  sortOrder: 50,
  sections: [
    {
      sectionKey: 'filters',
      kind: 'options',
      heading: '🗂️ Filter by Document Type',
      items: [
        { label: 'All' },
        { label: 'Birth Certificate' },
        { label: 'Marriage Certificate' },
        { label: 'Degree Certificate' },
        { label: 'Legal' },
        { label: 'Medical' },
        { label: 'Business' },
        { label: 'Visa' },
      ],
      settings: { langFilterHeading: '🌐 Filter by Language', langLimit: 10 },
    },
    {
      sectionKey: 'modal',
      kind: 'richtext',
      heading: 'Certificate preview modal',
      body:
        'Every certified translation is issued on official letterhead with a Certificate of Accuracy, our agency seal and signature, and ISO-9001:2015 / ISO 17100:2015 reference — accepted without re-certification by embassies, courts and universities.',
      settings: { previewTabLabel: '📄 Preview', downloadTabLabel: '⬇️ Download Sample', isoBadge: 'ISO 9001:2015 · ISO 17100:2015' },
    },
    {
      sectionKey: 'cta',
      kind: 'cta',
      heading: 'Need a Certified Translation Like These?',
      subheading: 'Free quote in 30 minutes. Express 24-hour delivery available.',
      buttonText: '📋 Get Free Quote',
      buttonLink: '/quote',
      button2Text: '💬 WhatsApp',
    },
  ],
};

const INDUSTRIES: PageSeed = {
  key: 'industries',
  slug: 'industries',
  title: 'Industries We Serve',
  navLabel: 'Industries',
  heroTag: 'Industries We Serve',
  heroTitle: '🏭 Industries <em>We Serve</em>',
  heroSubtitle: 'Domain-expert certified translators for every industry — legal, medical, pharma, automotive and more',
  metaTitle: 'Industry-Specific Translation Services | Language Guru',
  metaDesc:
    'Domain-expert translators for legal, healthcare, manufacturing, IT, finance, education, government and immigration sectors.',
  showInNav: true,
  showInFooter: true,
  sortOrder: 60,
  sections: [
    {
      sectionKey: 'grid',
      kind: 'grid',
      heading: 'Industry grid',
      settings: { source: 'industries' },
    },
    {
      sectionKey: 'cta',
      kind: 'cta',
      heading: 'Need a Domain-Specific Translator?',
      subheading: 'We match you with subject-matter experts for every industry. Get a free quote in 30 minutes.',
      buttonText: '📋 Get Quote',
      buttonLink: '/quote',
      button2Text: '💬 WhatsApp',
    },
  ],
};

const TRANSLATORS: PageSeed = {
  key: 'translators',
  slug: 'translators',
  title: 'Our Translation Team',
  navLabel: 'Translators',
  heroTitle: '👨‍💼👩‍💼 Our <em>Translation Team</em>',
  heroSubtitle: 'Certified translators and interpreters across India',
  metaTitle: 'Our Certified Translators & Interpreters | Language Guru',
  metaDesc: 'Meet our certified translators and interpreters — searchable by language, city and specialisation.',
  showInFooter: true,
  sortOrder: 70,
  sections: [
    {
      sectionKey: 'filters',
      kind: 'options',
      heading: 'Specialisations',
      body: 'Options offered in the specialisation filter.',
      items: [
        { label: 'Legal' },
        { label: 'Medical' },
        { label: 'Technical' },
        { label: 'Academic' },
        { label: 'Business' },
        { label: 'Immigration' },
      ],
      settings: {
        searchLabel: 'Search',
        searchPlaceholder: 'Name, language or city…',
        allLanguages: 'All Languages',
        allCities: 'All Cities',
        allSpecs: 'All Specializations',
        resetLabel: '↺ Reset',
        emptyHeading: 'No translators found',
      },
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// QUOTE · JOIN · PAYMENT
// ═══════════════════════════════════════════════════════════════════════════
const QUOTE: PageSeed = {
  key: 'quote',
  slug: 'quote',
  title: 'Get Your Free Quote',
  navLabel: 'Get Quote',
  heroTitle: '📋 Get Your Free Quote',
  heroSubtitle: 'Live price calculator · Response in 30 minutes · No commitment required',
  metaTitle: 'Get a Free Translation Quote | Language Guru',
  metaDesc: 'Instant translation price calculator. Free quote in 30 minutes with no commitment.',
  showInNav: true,
  showInFooter: true,
  sortOrder: 80,
  sections: [
    {
      sectionKey: 'document-types',
      kind: 'options',
      heading: 'Document types',
      body: 'Options in the document-type dropdown on the quote and hero forms.',
      items: [
        'Birth Certificate', 'Marriage Certificate', 'Death Certificate', 'Divorce Certificate',
        'Degree Certificate', 'Diploma Certificate', 'Mark Sheet / Transcripts', 'School Leaving Certificate',
        'Passport', 'Visa / Immigration Documents', 'PCC / Police Clearance', 'Driving License',
        'Legal Contract / Agreement', 'Court Order / Judgement', 'Power of Attorney', 'Affidavit',
        'Will / Probate', 'Medical Report', 'Vaccination Certificate', 'Bank Statement',
        'Income Tax Return', 'Salary Slip', 'Business / Company Documents', 'MOA / AOA',
        'Patent / Technical Document', 'Aadhaar Card', 'PAN Card', 'Other Document',
      ].map((label) => ({ label })),
    },
    {
      sectionKey: 'interpreter-types',
      kind: 'options',
      heading: 'Interpretation assignment types',
      items: [
        'Business Meeting', 'Conference Interpreter', 'Legal / Court Interpreter', 'Trade Fair/Exhibitions',
        'Machine Installation', 'Pharma Audit', 'Plant Visit', 'Market Research', 'Government Meetings',
        'Medical Interpreter', 'Tour Escort Service', 'Online Meetings', 'Others',
      ].map((label) => ({ label })),
    },
    {
      sectionKey: 'notes',
      kind: 'richtext',
      heading: 'Pricing notes',
      settings: {
        translation:
          '*Indicative rates only; final charges may vary by language pair, document type, complexity & number of pages.',
        interpretation:
          '*Indicative rates only; final charges may vary by language pair, assignment type, duration, location, experience and project requirements.',
        gstLabel: 'GST (18%)',
        gstRate: 18,
      },
    },
    {
      sectionKey: 'success',
      kind: 'richtext',
      heading: 'Submission confirmation',
      subheading: 'Quote Submitted Successfully!',
      body:
        'Thank you for your enquiry. Our team will review your requirement and reply within 30 minutes during working hours (Mon–Sat, 9am–7pm).',
      buttonText: '💳 Make Payment →',
      buttonLink: '/payment',
    },
  ],
};

const JOIN: PageSeed = {
  key: 'join',
  slug: 'join',
  title: 'Join Our Team',
  navLabel: '🤝 Join',
  heroTitle: 'Join Our Translation Team',
  heroSubtitle: 'Work with India’s most trusted certified translation agency',
  metaTitle: 'Careers — Join Our Translator Network | Language Guru',
  metaDesc: 'Apply to join Language Guru as a freelance or in-house translator or interpreter.',
  showInFooter: true,
  sortOrder: 90,
  sections: [
    {
      sectionKey: 'intro',
      kind: 'richtext',
      heading: 'Why work with us',
      body:
        'We work with certified translators and interpreters across 120+ languages. Applications are reviewed by our HR team and we get in touch when your profile matches an active requirement.',
    },
    {
      sectionKey: 'perks',
      kind: 'cards',
      heading: 'What we offer',
      items: [
        { icon: '💰', title: 'Competitive Rates', desc: 'Transparent per-page and per-day rates, paid on agreed cycles.' },
        { icon: '📅', title: 'Flexible Work', desc: 'Freelance or in-house, remote or on-site assignments.' },
        { icon: '📚', title: 'Domain Variety', desc: 'Legal, medical, technical, academic, financial and government projects.' },
        { icon: '🤝', title: 'Long-Term Partnership', desc: 'Steady volume for translators who consistently deliver on time.' },
      ],
    },
    {
      sectionKey: 'expertise',
      kind: 'options',
      heading: 'Areas of expertise',
      items: [
        'Document Translation', 'Legal Translation', 'Medical / Healthcare Translation',
        'Technical / Engineering Translation', 'Financial / Banking Translation',
        'Academic / Educational Translation', 'Literary / Creative Translation',
        'Website / Software Localisation', 'Consecutive Interpretation',
        'Simultaneous Interpretation', 'Conference Interpretation', 'Court / Legal Interpretation',
        'Medical Interpretation', 'Telephone / Remote Interpretation', 'Subtitling / Voice-over',
        'Certified / Sworn Translation', 'Transcription', 'Other',
      ].map((label) => ({ label })),
    },
    {
      sectionKey: 'experience',
      kind: 'options',
      heading: 'Experience bands',
      items: [
        'Less than 1 Year', '1 – 2 Years', '3 – 4 Years', '5 – 6 Years',
        '7 – 8 Years', '9 – 10 Years', '10 – 15 Years', '15+ Years',
      ].map((label) => ({ label })),
    },
    {
      sectionKey: 'consent',
      kind: 'richtext',
      heading: 'Consent',
      body:
        'I confirm the information provided is accurate and consent to Language Guru storing it for recruitment purposes.',
      settings: { submitLabel: 'Submit Application', successHeading: 'Congratulations!' },
    },
  ],
};

const PAYMENT: PageSeed = {
  key: 'payment',
  slug: 'payment',
  title: 'Make Payment',
  navLabel: 'Payment',
  heroTitle: 'Make Payment',
  heroSubtitle: 'Secure payment via UPI, card, net banking, PayPal or bank transfer',
  metaTitle: 'Make a Payment | Language Guru',
  metaDesc: 'Pay securely for your translation order via UPI, card, net banking, PayPal or NEFT.',
  showInFooter: true,
  sortOrder: 100,
  sections: [
    {
      sectionKey: 'methods',
      kind: 'cards',
      heading: 'Payment methods',
      body: 'Bank, UPI and PayPal identifiers come from Site Settings — only the descriptions live here.',
      items: [
        { key: 'UPI', icon: '📱', title: 'UPI', desc: 'Scan the QR code or use any UPI app (GPay, PhonePe, BHIM, Paytm) to pay directly.' },
        { key: 'Card', icon: '💳', title: 'Card', desc: 'Visa, Mastercard and RuPay debit/credit cards via an encrypted payment gateway.' },
        { key: 'NetBanking', icon: '🏦', title: 'Net Banking', desc: 'Available for all major Indian banks. Choose your bank on the next screen.' },
        { key: 'Razorpay', icon: '⚡', title: 'Razorpay', desc: 'UPI, cards, wallets, EMI or net banking through our secure Razorpay gateway.' },
        { key: 'PayPal', icon: '🌐', title: 'PayPal', desc: 'International payments via PayPal. You will be redirected to PayPal’s secure portal.' },
        { key: 'NEFT', icon: '🔄', title: 'NEFT / RTGS', desc: 'Direct bank transfer. Share the UTR number with us once the transfer completes.' },
      ],
    },
    {
      sectionKey: 'security',
      kind: 'richtext',
      heading: 'Secure payment',
      body:
        'All card and net-banking payments are processed by our payment gateway over an encrypted connection. We never see or store your card details.',
      settings: { note: 'After paying by UPI or NEFT, please send the screenshot or UTR number so we can confirm your order.' },
    },
    {
      sectionKey: 'cta',
      kind: 'cta',
      heading: 'Payment Confirmed?',
      subheading: 'Send us the screenshot or UTR and we will start work immediately.',
      button2Text: '💬 WhatsApp Receipt',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// EXISTING MODELLED PAGES — slug + nav only (content lives in their own models)
// ═══════════════════════════════════════════════════════════════════════════
const ABOUT: PageSeed = {
  key: 'about', slug: 'about', title: 'About Us', navLabel: 'About',
  metaTitle: "About Language Guru — India's Trusted ISO-Certified Translation Agency",
  metaDesc: 'Founded in 2005, ISO 9001:2015 & ISO 17100:2015 certified, MSME registered, serving 120+ languages across 150+ cities.',
  showInNav: true, showInFooter: true, sortOrder: 110, sections: [],
};

const CONTACT: PageSeed = {
  key: 'contact', slug: 'contact', title: 'Contact Us', navLabel: 'Contact',
  metaTitle: 'Contact Us — Language Guru',
  metaDesc: 'Contact Language Guru by phone, email, WhatsApp or visit our Delhi office. Response within 30 minutes.',
  showInNav: true, showInFooter: true, sortOrder: 120, sections: [],
};

const CLIENTS: PageSeed = {
  key: 'clients', slug: 'clients', title: 'Our Clients & Partners', navLabel: 'Clients',
  metaTitle: 'Our Clients & Partners — Language Guru',
  metaDesc: 'Trusted by clients across India including ministries, courts, hospitals, universities and large corporates.',
  showInFooter: true, sortOrder: 130, sections: [],
};

const SITEMAP: PageSeed = {
  key: 'sitemap', slug: 'sitemap', title: 'Sitemap', navLabel: 'Sitemap',
  metaTitle: 'Sitemap | Language Guru',
  metaDesc: 'Every page on the Language Guru website.',
  showInFooter: true, showInSitemap: false, sortOrder: 140, sections: [],
};

const PAGES: PageSeed[] = [
  HOME, SERVICES, LANGUAGES, CITIES, GALLERY, INDUSTRIES, TRANSLATORS,
  QUOTE, JOIN, PAYMENT, ABOUT, CONTACT, CLIENTS, SITEMAP,
];

// ═══════════════════════════════════════════════════════════════════════════
// LEGAL PAGES — slug-driven Page model
// ═══════════════════════════════════════════════════════════════════════════
const LEGAL_PAGES = [
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    metaTitle: 'Privacy Policy | Language Guru',
    metaDesc: 'How Language Guru collects, uses and protects your personal information and documents.',
    content: `<p>We are committed to protecting your privacy and the confidentiality of every document you send us. This policy explains what we collect, why, and how it is protected.</p>
<h2>1. Information We Collect</h2>
<p>We collect the name, email address, phone number and city you provide when requesting a quote or contacting us, together with any documents you submit for translation. We collect nothing that is not needed to deliver the service.</p>
<h2>2. How We Use Your Information</h2>
<p>Your information is used to prepare quotes, deliver translations, and communicate about your project. We do not sell, rent or share your personal information with third parties for marketing.</p>
<h2>3. Document Confidentiality</h2>
<p>Every translator and member of staff works under a signed non-disclosure agreement. Documents are handled in line with our ISO 9001:2015 and ISO 17100:2015 information-security procedures and are retained only as long as needed for delivery and quality records.</p>
<h2>4. Data Security</h2>
<p>We apply industry-standard technical and organisational measures to protect your data against unauthorised access, alteration or disclosure.</p>
<h2>5. Your Rights</h2>
<p>You may ask us what personal data we hold about you, request a correction, or request deletion once your project and its retention period are complete.</p>
<h2>6. Contact</h2>
<p>For any question about this policy or about how your data is handled, contact us using the details on our contact page.</p>`,
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    metaTitle: 'Terms of Service | Language Guru',
    metaDesc: 'The terms governing translation, interpretation, attestation and apostille services provided by Language Guru.',
    content: `<p>By commissioning translation, interpretation, attestation or apostille work from us, you agree to the terms below. Please read them before placing an order.</p>
<h2>1. Services Provided</h2>
<p>We provide professional translation, interpretation, apostille, attestation and related language services in line with ISO 9001:2015 and ISO 17100:2015 standards.</p>
<h2>2. Quotes and Payment</h2>
<p>Quotes are based on the material supplied. Rates are indicative until the source documents have been reviewed, and may vary by language pair, document type, complexity and page count. Payment or a deposit is required before work begins unless a corporate account is in place.</p>
<h2>3. Turnaround</h2>
<p>Delivery dates are agreed per project. Express service is available for most language pairs at an additional charge. Delays caused by illegible source material or late clarifications may move the delivery date.</p>
<h2>4. Confidentiality</h2>
<p>All documents and information are treated as confidential. Our translators and staff are bound by non-disclosure agreements.</p>
<h2>5. Acceptance by Third Parties</h2>
<p>Our certified translations are prepared to meet standard embassy, court and university requirements. Requirements vary by authority, country and purpose, so final acceptance rests with the receiving authority. Tell us the specific requirement and we will prepare the translation to match it.</p>
<h2>6. Revisions and Liability</h2>
<p>We correct any error in our work free of charge. Beyond that remedy, our liability is limited to the value of the affected order, and we are not liable for indirect or consequential loss.</p>
<h2>7. Governing Law</h2>
<p>These terms are governed by the laws of India, and disputes fall under the exclusive jurisdiction of the courts of New Delhi.</p>`,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTIONS
// ═══════════════════════════════════════════════════════════════════════════
const WHY_CHOOSE = [
  { icon: '🎯', title: 'Accuracy & Expertise', desc: 'Certified translators with deep domain knowledge in legal, medical, technical and academic fields. Every translation reviewed by a second expert, with free revisions on all orders.' },
  { icon: '🔒', title: 'Confidential & Secure', desc: 'All documents handled under strict NDA and ISO-9001:2015 / ISO 17100:2015 data-security protocols. Your personal, legal and medical documents are protected from start to delivery.' },
  { icon: '🏛️', title: 'Globally Recognized', desc: 'Translations accepted by embassies, universities, courts and government offices worldwide. MEA empanelled and embassy-approved.' },
  { icon: '⚡', title: 'Fast Turnaround', desc: 'Standard delivery in 2–3 business days. Express 24-hour service available for all common language pairs without compromising quality.' },
  { icon: '💰', title: 'Transparent Pricing', desc: 'Clear per-page pricing with no hidden charges and bulk discounts for large-volume orders. Instant online quotes available 24×7.' },
  { icon: '🌐', title: '120+ Languages', desc: 'Native-speaking certified translators for every major world language — European, Asian, Indian regional and Middle Eastern, including rare pairs.' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Student', city: 'Delhi', rating: 5, text: 'Got my degree certificate translated for a German university admission. The MEA apostille and notarization were completed in 48 hours and the documents were accepted without any questions.' },
  { name: 'Rahul Mehta', role: 'CEO', city: 'Mumbai', rating: 5, text: 'Excellent service for our legal contract translations. The team handled French, German and Japanese contracts with complete confidentiality. We will use them again.' },
  { name: 'Anjali Kapoor', role: 'Doctor', city: 'Bangalore', rating: 5, text: 'Very professional. Birth certificate translated for a Spain visa came back the next day with all attestations, and the embassy accepted it without issues.' },
  { name: 'Rajesh Kumar', role: 'Law Firm Partner', city: 'Mumbai', rating: 5, text: 'Our firm uses Language Guru regularly for German and French legal translations. The translators genuinely understand legal terminology.' },
  { name: 'Suresh Kapoor', role: 'Technical Director', city: 'Delhi', rating: 5, text: '200+ pages of German technical manuals translated to Hindi. Domain experts, consistent terminology, delivered on time.' },
  { name: 'Meena Iyer', role: 'Medical Professional', city: 'Chennai', rating: 5, text: 'Needed Japanese medical records translated for a patient. Clinically accurate and delivered within 12 hours.' },
];

const FAQS = [
  { category: 'General', question: 'Are your translations accepted by government departments and Indian courts?', answer: 'Our certified translations carry our agency seal, signature and a Certificate of Accuracy under ISO-9001:2015 and ISO 17100:2015, and are routinely accepted by government departments, courts, passport offices, RTOs, universities and banks. Requirements vary between authorities, so final acceptance rests with the receiving authority — tell us any specific format requirement and we will prepare the translation accordingly.' },
  { category: 'General', question: 'Are your translations accepted by embassies?', answer: 'Yes. Our certified translations are prepared to standard embassy and consular requirements, including the certified seal, Certificate of Accuracy, official letterhead and, where needed, notarization or MEA apostille. Each embassy sets its own rules, so tell us which embassy and purpose and we will match their exact format.' },
  { category: 'General', question: 'How much does certified translation cost?', answer: 'Pricing is per page and depends on the language pair, document type and turnaround. Economy, standard and express tiers are available, and add-ons such as notarization, MEA apostille and embassy attestation are priced separately. GST applies. Use the instant quote form for an exact price on your documents.' },
  { category: 'General', question: 'How long does translation take?', answer: 'Standard certified translation takes 3–5 working days. Express 24-hour delivery is available for common language pairs, and large projects of 50+ pages typically take 7–10 days. Urgent same-day service can be arranged on WhatsApp.' },
  { category: 'General', question: 'How do I submit my documents?', answer: 'Submit at our Delhi office, or send scanned copies by email or WhatsApp from anywhere in India. We return soft copies by email and courier hard copies to any PIN code on request.' },
  { category: 'General', question: 'What is included in a certified translation?', answer: 'Translation on official letterhead, our certified seal and signature, a Certificate of Accuracy, ISO certification reference, and both PDF and Word soft copies. Hard copies are couriered on request.' },
  { category: 'General', question: 'How is GST calculated?', answer: 'GST at 18% is applied to the full subtotal, including any add-ons such as notarization or apostille. Your quote shows the subtotal, GST and total separately.' },
  { category: 'General', question: 'Can I get translation into any Indian regional language?', answer: 'Yes. We cover all 22 scheduled Indian languages including Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu and Assamese, plus many regional languages beyond that list.' },

  { category: 'Services', question: 'Which translation service do I need?', answer: 'It depends on the purpose. Visa and embassy submissions need Certified plus Apostille; court filings need Legal plus Notarized; university applications need Certified Translation. Use the comparison table above, or describe your document and we will recommend the right service free of charge.' },
  { category: 'Services', question: 'How fast can you deliver a certified translation?', answer: 'Standard turnaround is 24–72 hours depending on length and language. Express 24-hour service is available for all common languages, and same-day service can be arranged for urgent visa or embassy submissions in Delhi NCR.' },
  { category: 'Services', question: 'What is the difference between certified, notarized and apostille?', answer: 'Certified includes our agency seal, signature and Certificate of Accuracy, and is accepted by most universities and many government bodies. Notarized adds a notary public attestation, often required for legal documents. Apostille adds Ministry of External Affairs authentication on top, required for use in Hague Convention countries.' },
  { category: 'Services', question: 'Do you offer interpretation for live events?', answer: 'Yes — simultaneous, consecutive and whispered interpretation for conferences, courts, business meetings, diplomatic events and medical consultations. Equipment such as booths, headsets and microphones is available for larger events.' },

  { category: 'Cities', question: 'Do you charge more outside Delhi?', answer: 'No. Pricing is flat across India. A certified translation costs the same from Mumbai or Chennai as it does in Delhi. Courier delivery for hard copies is available on request; unusually bulky shipments may carry a clearly itemised courier charge.' },
  { category: 'Cities', question: 'How do I send documents if I am not in Delhi?', answer: 'Send clear scans or photographs by email or WhatsApp. We translate from the scans, email the soft copy, and courier the certified hard copy to any PIN code in India.' },
  { category: 'Cities', question: 'Which cities do you cover?', answer: 'We serve 150+ Indian cities across all states and union territories, with a physical office in Delhi NCR for walk-in submission.' },
];

const CLIENT_LOGOS = [
  'Ministry of External Affairs', 'Delhi High Court', 'AIIMS New Delhi', 'IIT Delhi',
  'State Bank of India', 'ISRO', 'NTPC Limited', 'BHEL',
].map((name, i) => ({ name, sortOrder: (i + 1) * 10 }));

// ═══════════════════════════════════════════════════════════════════════════
// WRITE
// ═══════════════════════════════════════════════════════════════════════════
async function seedPages() {
  console.log(`⏳ ${PAGES.length} pages…`);
  let sectionCount = 0;

  for (const p of PAGES) {
    const pageData = {
      slug: p.slug,
      title: p.title,
      navLabel: p.navLabel ?? p.title,
      heroTag: p.heroTag ?? null,
      heroTitle: p.heroTitle ?? null,
      heroSubtitle: p.heroSubtitle ?? null,
      metaTitle: p.metaTitle ?? p.title,
      metaDesc: p.metaDesc ?? null,
      showInNav: p.showInNav ?? false,
      showInFooter: p.showInFooter ?? false,
      showInSitemap: p.showInSitemap ?? true,
      sortOrder: p.sortOrder,
      isActive: true,
    };

    // Only seed the slug on create — never overwrite a slug an admin has changed.
    const existing = await prisma.sitePage.findUnique({ where: { key: p.key } });
    if (existing) {
      const { slug, ...rest } = pageData;
      void slug;
      await prisma.sitePage.update({ where: { key: p.key }, data: rest });
    } else {
      await prisma.sitePage.create({ data: { key: p.key, ...pageData } });
    }

    for (const [i, s] of p.sections.entries()) {
      const sectionData = {
        kind: s.kind,
        tag: s.tag ?? null,
        heading: s.heading ?? null,
        subheading: s.subheading ?? null,
        body: s.body ?? null,
        layout: s.layout ?? 'text-only',
        buttonText: s.buttonText ?? null,
        buttonLink: s.buttonLink ?? null,
        button2Text: s.button2Text ?? null,
        button2Link: s.button2Link ?? null,
        items: (s.items ?? null) as never,
        settings: (s.settings ?? null) as never,
        sortOrder: (i + 1) * 10,
        isActive: true,
      };
      await prisma.pageSection.upsert({
        where: { pageKey_sectionKey: { pageKey: p.key, sectionKey: s.sectionKey } },
        update: sectionData,
        create: { pageKey: p.key, sectionKey: s.sectionKey, ...sectionData },
      });
      sectionCount++;
    }
  }
  console.log(`   ✅ ${PAGES.length} pages, ${sectionCount} sections`);
}

async function seedLegalPages() {
  console.log(`⏳ ${LEGAL_PAGES.length} legal pages…`);
  for (const p of LEGAL_PAGES) {
    await prisma.page.upsert({
      where: { slug: p.slug },
      update: { title: p.title, content: p.content, metaTitle: p.metaTitle, metaDesc: p.metaDesc, isActive: true },
      create: { ...p, isActive: true },
    });
  }
  console.log(`   ✅ ${LEGAL_PAGES.length} legal pages`);
}

async function seedHomeSections() {
  // The existing HomePageSection model drives the long-form bands on the home
  // page. Seeded here so the home page is not empty on a fresh database.
  const bands = [
    {
      sectionId: 'about', tag: 'About The Company', sortOrder: 10, layout: 'image-right',
      title: "Language Guru — India's Premier <em>Translation Agency</em>",
      content:
        '<p>Language Guru is a one-stop language translation and interpretation service provider founded in 2005 and headquartered in New Delhi. We deliver ISO-9001:2015 and ISO 17100:2015 certified translations across 120+ world languages with accuracy, speed and full embassy and government acceptance.</p><p>We serve clients across India — Delhi NCR, Mumbai, Chennai, Bangalore, Pune, Hyderabad, Kolkata — and 150+ other cities. Our government-authorized, MSME-registered agency is trusted by law firms, hospitals, universities, corporates and embassies.</p><p>Every translation goes through a two-step quality process: a qualified native-speaking translator followed by an independent proofreader, under our ISO quality-management framework. All documents are handled under signed NDAs.</p>',
      buttonText: 'Learn More About Us →', buttonLink: '/about',
      stat1Value: '10K+', stat1Label: 'Documents Delivered', stat2Value: '190+', stat2Label: 'Countries Served',
    },
    {
      sectionId: 'legal', tag: 'Legal & Compliance', sortOrder: 20, layout: 'image-left',
      title: 'Legal Translation <em>Services in Delhi</em>',
      content:
        '<p>We provide legal document translation to government agencies, law firms, corporates and individuals. Our legal translators understand legal terminology in both the source and target language, and work under strict NDAs.</p><p>Expertise covers <strong>court orders, business contracts, partnership agreements, judgments, property papers, affidavits, powers of attorney, wills, patents and trademark filings</strong> across 120+ languages. Apostille and attestation are available under the same roof.</p>',
      buttonText: 'Get Legal Quote →', buttonLink: '/services/legal',
    },
    {
      sectionId: 'document', tag: 'Document Translation', sortOrder: 30, layout: 'image-right',
      title: 'Document Translation <em>Services in Delhi</em>',
      content:
        '<p>We convert your most important documents — personal, academic, legal, medical, financial and corporate — into 120+ languages with precision, formatting integrity and full embassy and government acceptance.</p><p>From a single birth certificate to thousands of pages of contracts, every document is reviewed by a second linguist and issued with our ISO certification reference and a signed translator declaration.</p>',
      buttonText: 'Get Document Quote →', buttonLink: '/services/document',
    },
    {
      sectionId: 'certified', tag: 'Certified Services', sortOrder: 40, layout: 'image-right',
      title: 'Certified <em>Translation Services</em>',
      content:
        '<p>ISO-9001:2015 and ISO 17100:2015 certified translations accepted by embassies, consulates, courts and government offices worldwide. Each translation includes a signed translator declaration on official letterhead, making it embassy-ready without additional certification.</p><p>Our certified translators are native speakers and qualified professionals trained in legal, medical, technical and academic terminology, with delivery as fast as 24 hours.</p>',
      buttonText: 'Get Certified Quote →', buttonLink: '/services/certified',
    },
    {
      sectionId: 'interpreter', tag: 'Expert Services', sortOrder: 50, layout: 'image-right',
      title: 'Expert &amp; Qualified <em>Interpreter Services</em>',
      content:
        '<p>Multilingual interpretation across India for businesses, legal proceedings, medical consultations, government bodies and academic institutions. Our interpreters are certified subject-matter experts.</p><p>We cover simultaneous, consecutive, telephone and escort interpretation in 120+ language pairs, and provide equipment including booths, receivers and microphones for large events. Remote video and telephone interpretation is available for urgent requirements.</p>',
      buttonText: 'Book Interpreter →', buttonLink: '/quote',
    },
  ];

  console.log(`⏳ ${bands.length} home sections…`);
  for (const b of bands) {
    const { sectionId, ...rest } = b;
    await prisma.homePageSection.upsert({
      where: { sectionId },
      update: { ...rest, isActive: true },
      create: { sectionId, ...rest, isActive: true },
    });
  }
  console.log(`   ✅ ${bands.length} home sections`);
}

async function seedCollections() {
  console.log(`⏳ collections…`);

  for (const [i, w] of WHY_CHOOSE.entries()) {
    const existing = await prisma.whyChooseItem.findFirst({ where: { title: w.title } });
    if (existing) {
      await prisma.whyChooseItem.update({ where: { id: existing.id }, data: { ...w, sortOrder: (i + 1) * 10, isActive: true } });
    } else {
      await prisma.whyChooseItem.create({ data: { ...w, sortOrder: (i + 1) * 10, isActive: true } });
    }
  }
  console.log(`   ✅ ${WHY_CHOOSE.length} why-choose items`);

  for (const [i, t] of TESTIMONIALS.entries()) {
    const existing = await prisma.testimonial.findFirst({ where: { name: t.name, text: t.text } });
    if (!existing) {
      await prisma.testimonial.create({ data: { ...t, sortOrder: (i + 1) * 10, isActive: true } });
    }
  }
  console.log(`   ✅ ${TESTIMONIALS.length} testimonials`);

  for (const [i, f] of FAQS.entries()) {
    const existing = await prisma.faq.findFirst({ where: { question: f.question } });
    if (existing) {
      await prisma.faq.update({ where: { id: existing.id }, data: { ...f, sortOrder: (i + 1) * 10, isActive: true } });
    } else {
      await prisma.faq.create({ data: { ...f, sortOrder: (i + 1) * 10, isActive: true } });
    }
  }
  console.log(`   ✅ ${FAQS.length} FAQs`);

  for (const c of CLIENT_LOGOS) {
    const existing = await prisma.client.findFirst({ where: { name: c.name } });
    if (existing) {
      await prisma.client.update({ where: { id: existing.id }, data: { sortOrder: c.sortOrder, isActive: true } });
    } else {
      await prisma.client.create({ data: { ...c, isActive: true } });
    }
  }
  console.log(`   ✅ ${CLIENT_LOGOS.length} clients`);
}

async function main() {
  console.log('📝 Seeding page & section content…');
  await seedPages();
  await seedLegalPages();
  await seedHomeSections();
  await seedCollections();
  console.log('🎉 Content seeded.');
}

main()
  .catch((e) => {
    console.error('❌ Content seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
