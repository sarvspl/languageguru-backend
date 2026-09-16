const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const INDUSTRIES = [
  { icon: '⚖️', name: 'Legal & Court', desc: 'Contracts · Patents · Court Orders', svc: 'legal' },
  { icon: '🏥', name: 'Healthcare & Pharma', desc: 'Pharma · Clinical · Medical Records', svc: 'medical' },
  { icon: '🏭', name: 'Manufacturing', desc: 'Technical Manuals · Engineering', svc: 'technical' },
  { icon: '💻', name: 'Technology & IT', desc: 'Software · API Docs · Localization', svc: 'technical' },
  { icon: '🏦', name: 'Banking & Finance', desc: 'Reports · Statements · Filings', svc: 'financial' },
  { icon: '🎓', name: 'Education & Academic', desc: 'Certificates · Research · DDV', svc: 'academic' },
  { icon: '🏛️', name: 'Government & Public', desc: 'Diplomatic · Official Docs', svc: 'certified' },
  { icon: '✈️', name: 'Travel & Immigration', desc: 'Visa · PCC · Passport', svc: 'certified' }
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
