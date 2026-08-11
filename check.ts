import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany();
  
  // Find services that end in "-translation"
  const duplicates = services.filter(s => s.key.endsWith('-translation') && s.key !== 'certified-translation' && s.key !== 'legal-translation' && s.key !== 'medical-translation' && s.key !== 'business-translation');
  
  // Wait, some actual services might end in translation if that's their name?
  // Let's just delete the ones that have "-translation" IF there is another service with the same name.
  const nameToKeys: Record<string, string[]> = {};
  for (const s of services) {
    if (!nameToKeys[s.name]) nameToKeys[s.name] = [];
    nameToKeys[s.name].push(s.key);
  }
  
  const toDelete = [];
  for (const s of services) {
    if (nameToKeys[s.name].length > 1) {
      if (s.key.endsWith('-translation') && s.key !== 'notarized-translation' && s.key !== 'certified-translation') { 
         // Wait, the correct original key for certified is 'certified'.
         if (s.key === 'certified-translation' || s.key === 'legal-translation' || s.key === 'document-translation' || s.key === 'medical-translation' || s.key === 'technical-translation' || s.key === 'academic-translation' || s.key === 'business-translation' || s.key === 'financial-translation' || s.key === 'immigration-translation' || s.key === 'notarized-translation') {
             toDelete.push(s.id);
         }
      }
    }
  }
  
  console.log('Deleting duplicate IDs:', toDelete);
  if (toDelete.length > 0) {
    await prisma.service.deleteMany({
      where: { id: { in: toDelete } }
    });
    console.log('Deleted duplicates.');
  } else {
    console.log('No duplicates found.');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
