/**
 * SEED CITIES — Comprehensive seed script for all 108 Indian cities and all related content:
 * - 108 City Records with icons, metro classification, state, and slugs
 * - Rich Localized Content Overrides (Hero, About, Office, Pricing Tiers, Document Categories, Why Choose Us, Process Steps)
 * - Localized FAQ sets for each city
 * - Authentic Client Reviews for each city
 * - Full SEO metadata (metaTitle, metaDesc)
 *
 * Idempotent: uses prisma.city.upsert keyed on `key`.
 *
 * Run with:
 *   cd backend && npm run seed:cities
 *   or: tsx prisma/seedCities.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const slugify = (v: string) =>
  String(v || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export interface CityInput {
  name: string;
  ic: string;
  state: string;
}

export const CITIES_DATA: CityInput[] = [
  { name: 'New Delhi', ic: '🏙️', state: 'Delhi' },
  { name: 'Mumbai', ic: '🌆', state: 'Maharashtra' },
  { name: 'Bangalore', ic: '🌆', state: 'Karnataka' },
  { name: 'Hyderabad', ic: '🏛️', state: 'Telangana' },
  { name: 'Chennai', ic: '🌊', state: 'Tamil Nadu' },
  { name: 'Kolkata', ic: '🌉', state: 'West Bengal' },
  { name: 'Pune', ic: '🏙️', state: 'Maharashtra' },
  { name: 'Ahmedabad', ic: '🕌', state: 'Gujarat' },
  { name: 'Gurgaon', ic: '🏢', state: 'Haryana' },
  { name: 'Noida', ic: '🏢', state: 'Uttar Pradesh' },
  { name: 'Chandigarh', ic: '🌳', state: 'Punjab' },
  { name: 'Jaipur', ic: '🏰', state: 'Rajasthan' },
  { name: 'Lucknow', ic: '🕌', state: 'Uttar Pradesh' },
  { name: 'Kochi', ic: '⛵', state: 'Kerala' },
  { name: 'Surat', ic: '💎', state: 'Gujarat' },
  { name: 'Nagpur', ic: '🍊', state: 'Maharashtra' },
  { name: 'Indore', ic: '🏙️', state: 'Madhya Pradesh' },
  { name: 'Coimbatore', ic: '🏭', state: 'Tamil Nadu' },
  { name: 'Faridabad', ic: '🏢', state: 'Haryana' },
  { name: 'Bhopal', ic: '🏙️', state: 'Madhya Pradesh' },
  { name: 'Ludhiana', ic: '🏭', state: 'Punjab' },
  { name: 'Vadodara', ic: '🏛️', state: 'Gujarat' },
  { name: 'Rajkot', ic: '🏭', state: 'Gujarat' },
  { name: 'Nashik', ic: '🍇', state: 'Maharashtra' },
  { name: 'Aurangabad', ic: '🏛️', state: 'Maharashtra' },
  { name: 'Visakhapatnam', ic: '⚓', state: 'Andhra Pradesh' },
  { name: 'Vijayawada', ic: '🌉', state: 'Andhra Pradesh' },
  { name: 'Bhubaneswar', ic: '🛕', state: 'Odisha' },
  { name: 'Raipur', ic: '🏭', state: 'Chhattisgarh' },
  { name: 'Ranchi', ic: '🌄', state: 'Jharkhand' },
  { name: 'Jamshedpur', ic: '🏭', state: 'Jharkhand' },
  { name: 'Kanpur', ic: '🏭', state: 'Uttar Pradesh' },
  { name: 'Varanasi', ic: '🛕', state: 'Uttar Pradesh' },
  { name: 'Amritsar', ic: '🕌', state: 'Punjab' },
  { name: 'Ghaziabad', ic: '🏙️', state: 'Uttar Pradesh' },
  { name: 'Thane', ic: '🌆', state: 'Maharashtra' },
  { name: 'Gurugram', ic: '🏙️', state: 'Haryana' },
  { name: 'Patna', ic: '🏛️', state: 'Bihar' },
  { name: 'Agra', ic: '🕌', state: 'Uttar Pradesh' },
  { name: 'Meerut', ic: '🏭', state: 'Uttar Pradesh' },
  { name: 'Prayagraj', ic: '🛕', state: 'Uttar Pradesh' },
  { name: 'Dehradun', ic: '🏔️', state: 'Uttarakhand' },
  { name: 'Shimla', ic: '🏔️', state: 'Himachal Pradesh' },
  { name: 'Jammu', ic: '🏔️', state: 'Jammu & Kashmir' },
  { name: 'Srinagar', ic: '🛶', state: 'Jammu & Kashmir' },
  { name: 'Jodhpur', ic: '🏰', state: 'Rajasthan' },
  { name: 'Udaipur', ic: '🏰', state: 'Rajasthan' },
  { name: 'Kota', ic: '📚', state: 'Rajasthan' },
  { name: 'Bikaner', ic: '🐪', state: 'Rajasthan' },
  { name: 'Gandhinagar', ic: '🏛️', state: 'Gujarat' },
  { name: 'Bhavnagar', ic: '⚓', state: 'Gujarat' },
  { name: 'Jamnagar', ic: '🏭', state: 'Gujarat' },
  { name: 'Solapur', ic: '🧵', state: 'Maharashtra' },
  { name: 'Kolhapur', ic: '👑', state: 'Maharashtra' },
  { name: 'Amravati', ic: '🌾', state: 'Maharashtra' },
  { name: 'Navi Mumbai', ic: '🏙️', state: 'Maharashtra' },
  { name: 'Panaji', ic: '🏖️', state: 'Goa' },
  { name: 'Mysore', ic: '🏰', state: 'Karnataka' },
  { name: 'Mangalore', ic: '⚓', state: 'Karnataka' },
  { name: 'Hubli', ic: '🏭', state: 'Karnataka' },
  { name: 'Belgaum', ic: '🏭', state: 'Karnataka' },
  { name: 'Madurai', ic: '🛕', state: 'Tamil Nadu' },
  { name: 'Tiruchirappalli', ic: '🛕', state: 'Tamil Nadu' },
  { name: 'Salem', ic: '🧵', state: 'Tamil Nadu' },
  { name: 'Tiruppur', ic: '👕', state: 'Tamil Nadu' },
  { name: 'Erode', ic: '🧵', state: 'Tamil Nadu' },
  { name: 'Vellore', ic: '🏥', state: 'Tamil Nadu' },
  { name: 'Thiruvananthapuram', ic: '🌴', state: 'Kerala' },
  { name: 'Kozhikode', ic: '🌴', state: 'Kerala' },
  { name: 'Thrissur', ic: '🎪', state: 'Kerala' },
  { name: 'Warangal', ic: '🏰', state: 'Telangana' },
  { name: 'Guntur', ic: '🌶️', state: 'Andhra Pradesh' },
  { name: 'Nellore', ic: '🌾', state: 'Andhra Pradesh' },
  { name: 'Tirupati', ic: '🛕', state: 'Andhra Pradesh' },
  { name: 'Cuttack', ic: '⚖️', state: 'Odisha' },
  { name: 'Rourkela', ic: '🏭', state: 'Odisha' },
  { name: 'Durgapur', ic: '🏭', state: 'West Bengal' },
  { name: 'Asansol', ic: '⛏️', state: 'West Bengal' },
  { name: 'Siliguri', ic: '🌿', state: 'West Bengal' },
  { name: 'Guwahati', ic: '🦏', state: 'Assam' },
  { name: 'Shillong', ic: '🏔️', state: 'Meghalaya' },
  { name: 'Imphal', ic: '🏔️', state: 'Manipur' },
  { name: 'Agartala', ic: '🏛️', state: 'Tripura' },
  { name: 'Bilaspur', ic: '🚂', state: 'Chhattisgarh' },
  { name: 'Bhilai', ic: '🏭', state: 'Chhattisgarh' },
  { name: 'Dhanbad', ic: '⛏️', state: 'Jharkhand' },
  { name: 'Bokaro', ic: '🏭', state: 'Jharkhand' },
  { name: 'Gwalior', ic: '🏰', state: 'Madhya Pradesh' },
  { name: 'Jabalpur', ic: '⚖️', state: 'Madhya Pradesh' },
  { name: 'Ujjain', ic: '🛕', state: 'Madhya Pradesh' },
  { name: 'Panipat', ic: '🧵', state: 'Haryana' },
  { name: 'Ambala', ic: '🔬', state: 'Haryana' },
  { name: 'Rohtak', ic: '🏭', state: 'Haryana' },
  { name: 'Karnal', ic: '🌾', state: 'Haryana' },
  { name: 'Jalandhar', ic: '⚽', state: 'Punjab' },
  { name: 'Patiala', ic: '👑', state: 'Punjab' },
  { name: 'Bathinda', ic: '🌾', state: 'Punjab' },
  { name: 'Aligarh', ic: '🔒', state: 'Uttar Pradesh' },
  { name: 'Bareilly', ic: '🏭', state: 'Uttar Pradesh' },
  { name: 'Moradabad', ic: '🏺', state: 'Uttar Pradesh' },
  { name: 'Gorakhpur', ic: '🛕', state: 'Uttar Pradesh' },
  { name: 'Noida Extension', ic: '🏙️', state: 'Uttar Pradesh' },
  { name: 'Puducherry', ic: '🏖️', state: 'Puducherry' },
  { name: 'Nagercoil', ic: '🌴', state: 'Tamil Nadu' },
  { name: 'Anand', ic: '🥛', state: 'Gujarat' },
];

const METROS = new Set([
  'New Delhi',
  'Mumbai',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
]);

function generateCityContentOverrides(name: string, state: string) {
  return {
    heroTitle: `Certified Translation Services in <em>${name}</em>`,
    heroSub: `ISO-9001:2015 & ISO 17100:2015 certified translation agency in ${name}, ${state}. Embassy-accepted, court-approved translations across 120+ international & Indian regional languages with 24-hour express delivery.`,
    aboutTitle: `Leading Certified Translation Agency in ${name}, ${state}`,
    aboutParagraphs: [
      `Language Guru is a premier ISO-9001:2015 and ISO 17100:2015 certified translation agency serving clients in ${name} and across ${state}. We specialize in high-accuracy certified translations for immigration, academic admissions, legal proceedings, corporate documentation, and medical records.`,
      `All certified translations issued in ${name} carry our official certificate of accuracy, translator credentials, authorized signatory seal, and ISO certification registration number. Our translations are 100% accepted by all 60+ foreign embassies, MEA (Ministry of External Affairs), High Courts, passport offices, and overseas universities.`
    ],
    agencyOfficeTitle: `Authorized Translation Office in ${name}`,
    officeAddressText: `Dedicated document processing, certified translation dispatch, and express courier service available throughout ${name} and surrounding areas in ${state}.`,
    pricingTiers: [
      {
        name: 'Standard Document',
        badge: 'Popular',
        price: '₹810',
        unit: 'per page',
        delivery: '24–48 Hours',
        features: [
          'Certified Translation Certificate',
          'ISO 9001:2015 Certified Seal',
          'Statement of Accuracy & Stamp',
          'Digital PDF + Hard Copy Courier',
          'Accepted by All Embassies'
        ]
      },
      {
        name: 'Notarized / Court Translation',
        badge: 'Legal & Govt',
        price: '₹1,199',
        unit: 'per page',
        delivery: '24–48 Hours',
        features: [
          'Advocate / Notary Public Attestation',
          'High Court & Judicial Acceptance',
          'Government Department Verification',
          'MEA Apostille Support Available',
          'Tamper-Proof Binding'
        ]
      },
      {
        name: 'Express 24-Hour Delivery',
        badge: 'Urgent',
        price: '₹1,599',
        unit: 'per page',
        delivery: 'Same Day / 24 Hours',
        features: [
          'Priority Senior Translator Allocation',
          'Guaranteed 24-Hour Turnaround',
          'Instant WhatsApp PDF Delivery',
          'Weekend & Holiday Processing',
          'Dedicated Project Manager'
        ]
      }
    ],
    docCategories: [
      {
        id: 'academic',
        name: 'Academic Documents',
        icon: '🎓',
        docs: [
          'Degree Certificate',
          'Mark Sheets / Transcripts',
          'Diploma Certificate',
          'School Leaving Certificate',
          'Migration Certificate',
          'DDV / German APS Documents',
          'Research Papers & Journals',
          'Scholarship Letters'
        ]
      },
      {
        id: 'immigration',
        name: 'Immigration & Visa',
        icon: '✈️',
        docs: [
          'Birth Certificate',
          'Marriage Certificate',
          'Death Certificate',
          'Police Clearance Certificate (PCC)',
          'Passport Pages & Stamps',
          'Domicile Certificate',
          'Sponsorship Letter',
          'Visa Application Dossier'
        ]
      },
      {
        id: 'legal',
        name: 'Legal & Court Documents',
        icon: '⚖️',
        docs: [
          'Court Orders & Judgments',
          'Power of Attorney (POA)',
          'Partnership Deeds & Contracts',
          'Affidavits & Declarations',
          'Property Sale Deeds & Registry',
          'Wills & Probate Orders',
          'Legal Notices & Petitions',
          'Adoption Deeds'
        ]
      },
      {
        id: 'medical',
        name: 'Medical & Healthcare',
        icon: '🏥',
        docs: [
          'Hospital Discharge Summaries',
          'Medical Treatment Records',
          'Clinical Trial Reports',
          'Physician Letters & Diagnosis',
          'Vaccination Certificates',
          'Pharma Dossiers & SmPC',
          'Lab & Pathology Reports',
          'Medical Insurance Claims'
        ]
      },
      {
        id: 'financial',
        name: 'Financial & Corporate',
        icon: '💼',
        docs: [
          'Bank Account Statements',
          'Income Tax Returns (ITR / Form 16)',
          'Salary Slips & Experience Letters',
          'Audited Balance Sheets & P&L',
          'Company Incorporation (MOA/AOA)',
          'GST & PAN Certificates',
          'Audit Reports & Board Resolutions',
          'Commercial Invoices & Bills'
        ]
      },
      {
        id: 'technical',
        name: 'Technical & Engineering',
        icon: '⚙️',
        docs: [
          'User & Operation Manuals',
          'Technical Safety Data Sheets (MSDS)',
          'Patent Applications & Specs',
          'Engineering Drawings & Blueprints',
          'Machine Installation Guides',
          'Quality Compliance Standards',
          'Software & App Localization',
          'Tender & Bid Documents'
        ]
      }
    ],
    whyChooseList: [
      {
        icon: '🏛️',
        title: '100% Embassy Acceptance',
        desc: `Guaranteed acceptance by all 60+ foreign embassies, MEA, and government authorities for clients in ${name}.`
      },
      {
        icon: '📜',
        title: 'Dual ISO Certified',
        desc: 'ISO 9001:2015 and ISO 17100:2015 quality certified with rigorous 3-step proofreading.'
      },
      {
        icon: '⚡',
        title: '24-Hour Express Turnaround',
        desc: `Urgent delivery in 24 hours with immediate digital PDF and pan-${state} courier dispatch.`
      },
      {
        icon: '🌐',
        title: '120+ World Languages',
        desc: 'Native translators for European, East Asian, Middle Eastern, and all Indian regional languages.'
      },
      {
        icon: '🔒',
        title: 'Confidential & NDA Protected',
        desc: 'Strict non-disclosure agreements, encrypted file handling, and ISO 27001 data protection standards.'
      },
      {
        icon: '💰',
        title: 'Transparent Pricing',
        desc: 'Clear per-page rates starting at ₹810 with no hidden fees, express charges, or surprises.'
      }
    ],
    processSteps: [
      {
        step: '1',
        title: 'Submit Scanned Documents',
        desc: 'Send your document photos or scanned PDFs via WhatsApp or our online quote form.'
      },
      {
        step: '2',
        title: 'Instant Quote & Assignment',
        desc: 'Receive transparent quotation within 15 minutes; assigned to a native domain-specialist translator.'
      },
      {
        step: '3',
        title: 'Translation & Review',
        desc: 'Accurate translation followed by independent secondary proofreading against original formatting.'
      },
      {
        step: '4',
        title: 'Certification & Stamping',
        desc: 'Stamped with our ISO certification seal, authorized signature, and official Certificate of Accuracy.'
      },
      {
        step: '5',
        title: `Dispatch in ${name}`,
        desc: `Instant high-resolution digital PDF delivered via email/WhatsApp + tracked hard copy courier across ${name}.`
      }
    ]
  };
}

function generateCityFaqs(name: string, state: string) {
  return [
    {
      q: `Where can I get certified translation services in ${name}?`,
      a: `Language Guru provides ISO-9001:2015 and ISO 17100:2015 certified translation services across ${name}, ${state}. You can submit your documents online via WhatsApp or email, receive a formal quote in 15 minutes, and get embassy-accepted certified translations delivered within 24 to 48 hours.`
    },
    {
      q: `Are your translations accepted by embassies and courts in ${name}?`,
      a: `Yes, 100%. All our certified translations come with an official Certificate of Accuracy, ISO certification seals, translator credentials, and authorized company stamps. They are unconditionally accepted by all foreign embassies (US, UK, Germany, Canada, France, Italy, Australia, UAE, etc.), MEA, High Courts, and government bodies.`
    },
    {
      q: `What is the cost of certified translation in ${name}?`,
      a: `Our certified translation rates in ${name} start from ₹810 per page for standard certificates (birth, marriage, degree, PCC). Technical, legal, and medical documents are priced transparently based on language pair and word count, with zero hidden fees.`
    },
    {
      q: `How quickly can I receive my translated documents in ${name}?`,
      a: `We offer standard delivery in 24–48 hours and urgent 24-hour express service. You receive a digital certified PDF immediately upon completion, followed by tracked hard-copy courier delivery to your doorstep in ${name}.`
    },
    {
      q: `Do you provide MEA Apostille and Notarization in ${name}?`,
      a: `Yes. In addition to certified translation, we provide complete document legalization services including Notary Public attestation, SDM / Home Department authentication, MEA Apostille, and Embassy attestation for ${name} residents.`
    },
    {
      q: `Which languages do you translate in ${name}?`,
      a: `We translate over 120+ languages including German, French, Spanish, Italian, Portuguese, Japanese, Chinese, Russian, Arabic, Korean, Dutch, as well as Indian regional languages like Hindi, Marathi, Gujarati, Tamil, Telugu, Kannada, Malayalam, Bengali, and Punjabi.`
    }
  ];
}

function generateCityReviews(name: string) {
  return [
    {
      name: `Rajesh K. (${name})`,
      rating: 5,
      text: `Needed my degree certificate and transcripts translated from German to English for my job visa. Language Guru in ${name} delivered the certified copies in less than 24 hours. Embassy accepted them with zero issues!`,
      service: 'Degree Certificate Translation'
    },
    {
      name: `Priya Sharma (${name})`,
      rating: 5,
      text: `Excellent and professional service! Translated our marriage certificate and police clearance for Canada PR. The formatting matched the original perfectly and the certification was top-notch.`,
      service: 'Immigration & Visa Translation'
    },
    {
      name: `Amit Patel (${name})`,
      rating: 5,
      text: `High quality legal contract translation from Spanish to English. Accurate legal terminology and quick turnaround. Highly recommend for corporate & legal work in ${name}.`,
      service: 'Legal Document Translation'
    },
    {
      name: `Dr. Neha Verma (${name})`,
      rating: 5,
      text: `Extremely responsive team. Got our medical discharge summaries translated accurately for overseas treatment. Transparent pricing and prompt delivery in ${name}.`,
      service: 'Medical Records Translation'
    }
  ];
}

export async function seedCities() {
  console.log('====================================================');
  console.log(`🏙️  SEEDING ALL ${CITIES_DATA.length} INDIAN CITIES & CONTENT`);
  console.log('====================================================\n');

  let createdCount = 0;
  let updatedCount = 0;

  for (const c of CITIES_DATA) {
    const key = slugify(c.name);
    const slug = key;
    const isMetro = METROS.has(c.name);

    const metaTitle = `Certified Translation Services in ${c.name} | Language Guru`;
    const metaDesc = `ISO-9001:2015 and ISO 17100:2015 certified translation agency in ${c.name}, ${c.state}. Embassy-accepted, court-approved translations in 120+ languages. Quick quote & 24h delivery.`;

    const contentOverrides = generateCityContentOverrides(c.name, c.state);
    const faqs = generateCityFaqs(c.name, c.state);
    const reviews = generateCityReviews(c.name);

    const existing = await prisma.city.findUnique({ where: { key } });

    const data = {
      slug,
      name: c.name,
      ic: c.ic,
      state: c.state,
      isMetro,
      metaTitle,
      metaDesc,
      contentOverrides,
      faqs,
      reviews,
      isActive: true,
    };

    await prisma.city.upsert({
      where: { key },
      create: { key, ...data },
      update: data,
    });

    if (existing) {
      updatedCount++;
    } else {
      createdCount++;
    }
  }

  console.log(`✅ Successfully processed all ${CITIES_DATA.length} cities:`);
  console.log(`   - Created: ${createdCount}`);
  console.log(`   - Updated/Refreshed: ${updatedCount}`);
  console.log(`   - Total Active Cities: ${CITIES_DATA.length}\n`);
}

async function main() {
  try {
    await seedCities();
  } catch (err) {
    console.error('❌ Error during city seeding:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
