const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanTable(modelName, uniqueField) {
  console.log(`Cleaning duplicates in ${modelName}...`);
  const items = await prisma[modelName].findMany({
    orderBy: { createdAt: 'asc' }
  });

  const seen = new Set();
  const duplicateIds = [];

  for (const item of items) {
    const val = (item[uniqueField] || '').trim().toLowerCase();
    if (!val) continue;
    if (seen.has(val)) {
      duplicateIds.push(item.id);
    } else {
      seen.add(val);
    }
  }

  if (duplicateIds.length > 0) {
    const res = await prisma[modelName].deleteMany({
      where: { id: { in: duplicateIds } }
    });
    console.log(`✅ Removed ${res.count} duplicate rows from ${modelName}.`);
  } else {
    console.log(`✓ No duplicates found in ${modelName}.`);
  }
}

async function main() {
  await cleanTable('whyChooseItem', 'title');
  await cleanTable('testimonial', 'text');
  await cleanTable('faq', 'question');
  console.log('\n🎉 Database cleanup complete!');
}

main()
  .catch(e => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
