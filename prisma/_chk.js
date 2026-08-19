const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    const pages = await p.sitePage.findMany({ include: { sections: true }, orderBy: { sortOrder: 'asc' } });
    let total = 0;
    for (const pg of pages) {
      total += pg.sections.length;
      console.log(pg.key.padEnd(14), String(pg.sections.length).padStart(3), pg.sections.map((s) => s.sectionKey).join(','));
    }
    console.log('PAGES', pages.length, 'SECTIONS', total);
  } catch (e) {
    console.log('DB ERROR:', e.message);
  } finally {
    await p.$disconnect();
  }
})();
