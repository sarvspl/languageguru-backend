const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const INDUSTRIES = [
  { icon: '⚖️', name: 'Legal & Court', desc: 'Contracts · Patents · Court Orders · Affidavits · Judgments', svc: 'legal' },
  { icon: '🏥', name: 'Healthcare & Pharma', desc: 'Pharma dossiers · Clinical trials · Medical records · Audits', svc: 'medical' },
  { icon: '🏭', name: 'Manufacturing', desc: 'Technical manuals · Engineering drawings · Machine installation', svc: 'technical' },
  { icon: '💻', name: 'Technology & IT', desc: 'Software · API documentation · App & website localization', svc: 'technical' },
  { icon: '🏦', name: 'Banking & Finance', desc: 'Annual reports · Bank statements · Regulatory filings', svc: 'financial' },
  { icon: '🎓', name: 'Education & Academic', desc: 'Degree certificates · Transcripts · Research papers · DDV', svc: 'academic' },
  { icon: '🏛️', name: 'Government & Public', desc: 'Diplomatic correspondence · Tenders · Official documents', svc: 'certified' },
  { icon: '✈️', name: 'Travel & Immigration', desc: 'Visa documents · PCC · Passport · Birth & marriage certificates', svc: 'certified' }
];

async function main() {
  console.log('Seeding Industries...');
  for (const ind of INDUSTRIES) {
    await prisma.industry.upsert({
      where: { name: ind.name },
      update: {},
      create: {
        icon: ind.icon,
        name: ind.name,
        desc: ind.desc,
        svc: ind.svc,
        isActive: true
      }
    });
  }
  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
