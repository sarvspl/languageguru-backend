/**
 * Seed script: populate GalleryItem and Translator tables with static data.
 * Run: node prisma/seedGalleryTranslators.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GALLERY = [
  {doc:'Birth Certificate',    lang:'English → German',  flag:'🇩🇪', langKey:'german',     time:'24 Hrs', icon:'📜', seal:'🇩🇪', acc:'German Embassy',       cat:'Birth Certificate'},
  {doc:'Birth Certificate',    lang:'English → French',  flag:'🇫🇷', langKey:'french',     time:'24 Hrs', icon:'📜', seal:'🇫🇷', acc:'French Consulate',      cat:'Birth Certificate'},
  {doc:'Birth Certificate',    lang:'Hindi → Arabic',    flag:'🇸🇦', langKey:'arabic',     time:'48 Hrs', icon:'📜', seal:'🇸🇦', acc:'Saudi Consulate',        cat:'Birth Certificate'},
  {doc:'Marriage Certificate', lang:'English → Spanish', flag:'🇪🇸', langKey:'spanish',    time:'24 Hrs', icon:'💒', seal:'🇪🇸', acc:'Spanish Embassy',        cat:'Marriage Certificate'},
  {doc:'Marriage Certificate', lang:'Hindi → German',    flag:'🇩🇪', langKey:'german',     time:'48 Hrs', icon:'💒', seal:'🇩🇪', acc:'German Embassy',         cat:'Marriage Certificate'},
  {doc:'Marriage Certificate', lang:'English → Japanese',flag:'🇯🇵', langKey:'japanese',   time:'48 Hrs', icon:'💒', seal:'🇯🇵', acc:'Japanese Embassy',       cat:'Marriage Certificate'},
  {doc:'Degree Certificate',   lang:'English → Spanish', flag:'🇪🇸', langKey:'spanish',    time:'48 Hrs', icon:'🎓', seal:'🇪🇸', acc:'Spanish Embassy',        cat:'Degree Certificate'},
  {doc:'Academic Transcript',  lang:'English → French',  flag:'🇫🇷', langKey:'french',     time:'48 Hrs', icon:'📋', seal:'🇫🇷', acc:'French University',       cat:'Degree Certificate'},
  {doc:'Degree Certificate',   lang:'English → Chinese', flag:'🇨🇳', langKey:'chinese',    time:'72 Hrs', icon:'🎓', seal:'🇨🇳', acc:'Chinese Consulate',       cat:'Degree Certificate'},
  {doc:'Mark Sheet',           lang:'English → Arabic',  flag:'🇸🇦', langKey:'arabic',     time:'48 Hrs', icon:'📄', seal:'🇸🇦', acc:'Saudi Ministry',          cat:'Degree Certificate'},
  {doc:'Legal Agreement',      lang:'Hindi → English',   flag:'🇮🇳', langKey:'hindi',      time:'24 Hrs', icon:'⚖️', seal:'🇮🇳', acc:'Delhi High Court',        cat:'Legal'},
  {doc:'Power of Attorney',    lang:'English → German',  flag:'🇩🇪', langKey:'german',     time:'48 Hrs', icon:'⚖️', seal:'🇩🇪', acc:'German Embassy',          cat:'Legal'},
  {doc:'Affidavit',            lang:'English → Arabic',  flag:'🇸🇦', langKey:'arabic',     time:'24 Hrs', icon:'📝', seal:'🇸🇦', acc:'Saudi Consulate',         cat:'Legal'},
  {doc:'Court Order',          lang:'Hindi → English',   flag:'🇮🇳', langKey:'hindi',      time:'48 Hrs', icon:'⚖️', seal:'⚖️',  acc:'District Court',          cat:'Legal'},
  {doc:'Medical Report',       lang:'English → Arabic',  flag:'🇸🇦', langKey:'arabic',     time:'48 Hrs', icon:'🏥', seal:'🇸🇦', acc:'Saudi Consulate',         cat:'Medical'},
  {doc:'Discharge Summary',    lang:'English → German',  flag:'🇩🇪', langKey:'german',     time:'48 Hrs', icon:'🏥', seal:'🇩🇪', acc:'German Hospital',         cat:'Medical'},
  {doc:'Medical Certificate',  lang:'English → French',  flag:'🇫🇷', langKey:'french',     time:'24 Hrs', icon:'🏥', seal:'🇫🇷', acc:'French Consulate',        cat:'Medical'},
  {doc:'Company Registration', lang:'English → Arabic',  flag:'🇸🇦', langKey:'arabic',     time:'72 Hrs', icon:'🏢', seal:'🇸🇦', acc:'Ministry of Commerce',    cat:'Business'},
  {doc:'Bank Statement',       lang:'English → Chinese', flag:'🇨🇳', langKey:'chinese',    time:'24 Hrs', icon:'🏦', seal:'🇨🇳', acc:'Chinese Consulate',       cat:'Business'},
  {doc:'Business Contract',    lang:'English → Japanese',flag:'🇯🇵', langKey:'japanese',   time:'72 Hrs', icon:'💼', seal:'🇯🇵', acc:'Japanese Embassy',        cat:'Business'},
  {doc:'Visa Documents',       lang:'English → Japanese',flag:'🇯🇵', langKey:'japanese',   time:'24 Hrs', icon:'✈️', seal:'🇯🇵', acc:'Japanese Embassy',        cat:'Visa'},
  {doc:'Police Clearance',     lang:'Hindi → German',    flag:'🇩🇪', langKey:'german',     time:'48 Hrs', icon:'🚔', seal:'🇩🇪', acc:'German Embassy',          cat:'Visa'},
  {doc:'Police Clearance',     lang:'English → Korean',  flag:'🇰🇷', langKey:'korean',     time:'48 Hrs', icon:'🚔', seal:'🇰🇷', acc:'Korean Embassy',          cat:'Visa'},
  {doc:'Divorce Decree',       lang:'Hindi → English',   flag:'🇮🇳', langKey:'hindi',      time:'24 Hrs', icon:'📄', seal:'⚖️',  acc:'Family Court',            cat:'Visa'},
  {doc:'Technical Manual',     lang:'English → Korean',  flag:'🇰🇷', langKey:'korean',     time:'96 Hrs', icon:'⚙️', seal:'🇰🇷', acc:'Korean Business',         cat:'Business'},
  {doc:'Patent Document',      lang:'English → Chinese', flag:'🇨🇳', langKey:'chinese',    time:'96 Hrs', icon:'📑', seal:'🇨🇳', acc:'CNIPA',                   cat:'Business'},
];

const TRANSLATORS = [
  {name:'Priya Sharma',   lang:'German',  city:'New Delhi',  spec:'Legal',       exp:'8 years',  rate:'₹899/pg', cert:'MA Translation'},
  {name:'Rahul Verma',    lang:'French',  city:'Mumbai',     spec:'Business',    exp:'5 years',  rate:'₹899/pg', cert:'Alliance Française'},
  {name:'Anita Nair',     lang:'Arabic',  city:'New Delhi',  spec:'Immigration', exp:'10 years', rate:'₹949/pg', cert:'NAATI Certified'},
  {name:'Suresh Kumar',   lang:'Japanese',city:'Bangalore',  spec:'Technical',   exp:'7 years',  rate:'₹999/pg', cert:'JLPT N1'},
  {name:'Meena Pillai',   lang:'Chinese', city:'Chennai',    spec:'Business',    exp:'6 years',  rate:'₹999/pg', cert:'HSK 6'},
  {name:'Vikram Singh',   lang:'Spanish', city:'Hyderabad',  spec:'Medical',     exp:'9 years',  rate:'₹899/pg', cert:'MA Linguistics'},
  {name:'Neha Gupta',     lang:'Italian', city:'New Delhi',  spec:'Academic',    exp:'4 years',  rate:'₹850/pg', cert:'CILS B2'},
  {name:'Arjun Patel',    lang:'Russian', city:'Pune',       spec:'Technical',   exp:'11 years', rate:'₹949/pg', cert:'MA Translation'},
  {name:'Kavitha Reddy',  lang:'Korean',  city:'Bangalore',  spec:'Immigration', exp:'5 years',  rate:'₹999/pg', cert:'TOPIK II'},
  {name:'Rajan Mehta',    lang:'German',  city:'Mumbai',     spec:'Business',    exp:'12 years', rate:'₹949/pg', cert:'Goethe C2'},
  {name:'Sunita Rao',     lang:'French',  city:'Kolkata',    spec:'Legal',       exp:'7 years',  rate:'₹899/pg', cert:'DALF C2'},
  {name:'Deepak Joshi',   lang:'Arabic',  city:'Hyderabad',  spec:'Technical',   exp:'8 years',  rate:'₹949/pg', cert:'CACI Certified'},
  {name:'Pooja Iyer',     lang:'Japanese',city:'Chennai',    spec:'Medical',     exp:'6 years',  rate:'₹999/pg', cert:'JLPT N2'},
  {name:'Amit Saxena',    lang:'Chinese', city:'New Delhi',  spec:'Legal',       exp:'9 years',  rate:'₹999/pg', cert:'BCT B'},
  {name:'Lakshmi Devi',   lang:'Spanish', city:'Mumbai',     spec:'Academic',    exp:'5 years',  rate:'₹850/pg', cert:'DELE C1'},
  {name:'Nikhil Bose',    lang:'Italian', city:'Kolkata',    spec:'Business',    exp:'4 years',  rate:'₹850/pg', cert:'CELI C1'},
  {name:'Gayatri Pandey', lang:'Russian', city:'New Delhi',  spec:'Academic',    exp:'7 years',  rate:'₹949/pg', cert:'TORFL C2'},
  {name:'Sanjay Tiwari',  lang:'Korean',  city:'Mumbai',     spec:'Technical',   exp:'6 years',  rate:'₹999/pg', cert:'TOPIK II'},
  {name:'Ananya Das',     lang:'German',  city:'Bangalore',  spec:'Medical',     exp:'5 years',  rate:'₹899/pg', cert:'Goethe B2'},
  {name:'Ravi Krishnan',  lang:'French',  city:'Pune',       spec:'Immigration', exp:'8 years',  rate:'₹899/pg', cert:'TCF DA'},
  {name:'Mala Chattopadhyay',lang:'Arabic',city:'Kolkata',  spec:'Legal',       exp:'10 years', rate:'₹949/pg', cert:'MA Arabic'},
  {name:'Kartik Menon',   lang:'Japanese',city:'Hyderabad',  spec:'Business',    exp:'7 years',  rate:'₹999/pg', cert:'JLPT N1'},
  {name:'Divya Gupta',    lang:'Chinese', city:'New Delhi',  spec:'Technical',   exp:'5 years',  rate:'₹999/pg', cert:'BCT A'},
  {name:'Harish Nair',    lang:'Spanish', city:'Chennai',    spec:'Medical',     exp:'9 years',  rate:'₹899/pg', cert:'MA Linguistics'},
  {name:'Shweta Agarwal', lang:'Italian', city:'Mumbai',     spec:'Academic',    exp:'3 years',  rate:'₹850/pg', cert:'CILS C1'},
  {name:'Bharat Sharma',  lang:'Russian', city:'Bangalore',  spec:'Business',    exp:'6 years',  rate:'₹949/pg', cert:'TORFL B2'},
  {name:'Padmavati Rao',  lang:'Korean',  city:'Chennai',    spec:'Academic',    exp:'4 years',  rate:'₹999/pg', cert:'TOPIK I'},
  {name:'Sunil Chandra',  lang:'German',  city:'Hyderabad',  spec:'Technical',   exp:'11 years', rate:'₹949/pg', cert:'Goethe C1'},
  {name:'Nirmala Singh',  lang:'French',  city:'Pune',       spec:'Medical',     exp:'7 years',  rate:'₹899/pg', cert:'DELF B2'},
  {name:'Mahesh Pillai',  lang:'Arabic',  city:'Mumbai',     spec:'Immigration', exp:'9 years',  rate:'₹949/pg', cert:'MA Islamic Studies'},
];

async function main() {
  console.log('🌱 Seeding Gallery and Translators...');

  // Clear existing data
  await prisma.galleryItem.deleteMany();
  await prisma.translator.deleteMany();

  // Seed gallery
  for (const item of GALLERY) {
    await prisma.galleryItem.create({ data: item });
  }
  console.log(`✅ Seeded ${GALLERY.length} gallery items`);

  // Seed translators
  for (const t of TRANSLATORS) {
    await prisma.translator.create({ data: t });
  }
  console.log(`✅ Seeded ${TRANSLATORS.length} translators`);

  console.log('🎉 Done!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
