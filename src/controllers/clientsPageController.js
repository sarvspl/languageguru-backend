const prisma = require('../config/db');

const DEFAULT_INDUSTRIES = [
  { icon: '⚖️', title: 'Legal & Law Firms', desc: 'High Courts, advocates, law firms' },
  { icon: '🏥', title: 'Healthcare & Pharma', desc: 'Hospitals, pharma, clinical research' },
  { icon: '🏢', title: 'Corporates & MNCs', desc: 'Fortune 500, Indian conglomerates' },
  { icon: '🏛️', title: 'Government Bodies', desc: 'Ministries, PSUs, embassies' },
  { icon: '🎓', title: 'Universities', desc: 'IITs, IIMs, DU, JNU, foreign boards' },
  { icon: '✈️', title: 'Immigration', desc: 'Visa agents, PR applicants' },
  { icon: '🏦', title: 'Banking & Finance', desc: 'Banks, NBFCs, insurance firms' },
  { icon: '⚙️', title: 'Engineering & Tech', desc: 'ISRO, DRDO, NTPC, manufacturing' }
];

const DEFAULT_CLIENTS = [
  { icon: '🏛️', name: 'Ministry of External Affairs', category: 'Government' },
  { icon: '⚖️', name: 'Delhi High Court', category: 'Legal' },
  { icon: '🏥', name: 'AIIMS New Delhi', category: 'Healthcare' },
  { icon: '🎓', name: 'IIT Delhi', category: 'Education' },
  { icon: '🏦', name: 'State Bank of India', category: 'Banking' },
  { icon: '💻', name: 'Tata Consultancy', category: 'IT' },
  { icon: '💊', name: 'Sun Pharmaceutical', category: 'Pharma' },
  { icon: '✈️', name: 'Air India', category: 'Aviation' },
  { icon: '🏗️', name: 'L&T Construction', category: 'Engineering' },
  { icon: '🛢️', name: 'ONGC', category: 'Energy' },
  { icon: '🚀', name: 'ISRO', category: 'Research' },
  { icon: '🚗', name: 'Maruti Suzuki', category: 'Automotive' },
  { icon: '🏨', name: 'Taj Hotels', category: 'Hospitality' },
  { icon: '⚡', name: 'NTPC Limited', category: 'Energy' },
  { icon: '🌿', name: 'Dabur India', category: 'FMCG' },
  { icon: '🏭', name: 'BHEL', category: 'Engineering' }
];

const DEFAULT_REVIEWS = [
  { quote: 'Language Guru handles all our German and French legal translations. Embassy acceptance guaranteed every time.', author: 'Anil Verma', role: 'Partner, AV Law Associates · Delhi', rating: 5 },
  { quote: 'We use Language Guru for clinical trial document translations. Medical terminology accuracy is exceptional.', author: 'Dr. Sunita Das', role: 'Medical Director, ClinPath India · Mumbai', rating: 5 },
  { quote: '50,000+ words of Arabic technical manual translation. Delivered in 10 days, under budget, with domain experts.', author: 'Rajiv Gupta', role: 'GM Operations, TechPro · Faridabad', rating: 5 }
];

const DEFAULT_CLIENTS_PAGE = {
  id: 'singleton',
  heroTitle: 'Our Clients & Partners',
  heroSubtitle: '10,000+ satisfied clients across India — law firms, hospitals, embassies and Fortune 500 companies',
  stat1Val: '10,000+',
  stat1Label: 'Happy Clients',
  stat2Val: '500+',
  stat2Label: 'Corporate Clients',
  stat3Val: '190+',
  stat3Label: 'Countries Served',
  stat4Val: '4.9★',
  stat4Label: 'Average Rating',
  industriesTitle: 'Industries We Serve',
  industriesList: JSON.stringify(DEFAULT_INDUSTRIES),
  clientsTitle: 'Our Valued Clients',
  clientsList: JSON.stringify(DEFAULT_CLIENTS),
  reviewsTitle: 'What Our Clients Say',
  reviewsList: JSON.stringify(DEFAULT_REVIEWS),
  ctaTitle: 'Join 10,000+ Satisfied Clients',
  ctaSubtitle: 'ISO-certified translation. Embassy acceptance guaranteed. Quote in 30 minutes.',
  ctaBtnText: '📋 Get Free Quote',
  metaTitle: 'Our Clients & Partners — Language Guru',
  metaDesc: 'Language Guru is trusted by 10,000+ clients across India including ministries, high courts, AIIMS, IITs, and Fortune 500 companies.'
};

const getClientsPageData = async () => {
  if (prisma.clientsPage && typeof prisma.clientsPage.findUnique === 'function') {
    let page = await prisma.clientsPage.findUnique({ where: { id: 'singleton' } });
    if (!page) {
      page = await prisma.clientsPage.create({ data: DEFAULT_CLIENTS_PAGE });
    }
    return page;
  }

  // Fallback to raw query
  const rows = await prisma.$queryRawUnsafe('SELECT * FROM "ClientsPage" WHERE id = \'singleton\' LIMIT 1');
  if (rows && rows.length > 0) {
    return rows[0];
  }

  const keys = Object.keys(DEFAULT_CLIENTS_PAGE);
  const cols = keys.map(k => `"${k}"`).join(', ') + ', "updatedAt"';
  const vals = keys.map(k => `'${DEFAULT_CLIENTS_PAGE[k].replace(/'/g, "''")}'`).join(', ') + ', NOW()';
  await prisma.$executeRawUnsafe(`INSERT INTO "ClientsPage" (${cols}) VALUES (${vals})`);
  const newRows = await prisma.$queryRawUnsafe('SELECT * FROM "ClientsPage" WHERE id = \'singleton\' LIMIT 1');
  return newRows[0] || DEFAULT_CLIENTS_PAGE;
};

// GET /api/v1/clients-page
exports.getClientsPage = async (req, res) => {
  try {
    const data = await getClientsPageData();

    let industries = DEFAULT_INDUSTRIES;
    let clientBrands = DEFAULT_CLIENTS;
    let reviews = DEFAULT_REVIEWS;

    try {
      if (data.industriesList) {
        industries = typeof data.industriesList === 'string' ? JSON.parse(data.industriesList) : data.industriesList;
      }
    } catch {}

    try {
      if (data.clientsList) {
        clientBrands = typeof data.clientsList === 'string' ? JSON.parse(data.clientsList) : data.clientsList;
      }
    } catch {}

    try {
      if (data.reviewsList) {
        reviews = typeof data.reviewsList === 'string' ? JSON.parse(data.reviewsList) : data.reviewsList;
      }
    } catch {}

    res.json({
      success: true,
      data: {
        ...data,
        industries,
        clientBrands,
        reviews
      }
    });
  } catch (error) {
    console.error('Error in getClientsPage:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/v1/clients-page
exports.updateClientsPage = async (req, res) => {
  try {
    const allowedFields = [
      'heroTitle', 'heroSubtitle',
      'stat1Val', 'stat1Label', 'stat2Val', 'stat2Label',
      'stat3Val', 'stat3Label', 'stat4Val', 'stat4Label',
      'industriesTitle', 'industriesList',
      'clientsTitle', 'clientsList',
      'reviewsTitle', 'reviewsList',
      'ctaTitle', 'ctaSubtitle', 'ctaBtnText',
      'metaTitle', 'metaDesc'
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'industriesList' || field === 'clientsList' || field === 'reviewsList') {
          updateData[field] = typeof req.body[field] === 'string' ? req.body[field] : JSON.stringify(req.body[field]);
        } else {
          updateData[field] = String(req.body[field]);
        }
      }
    }

    if (prisma.clientsPage && typeof prisma.clientsPage.upsert === 'function') {
      const updated = await prisma.clientsPage.upsert({
        where: { id: 'singleton' },
        create: { id: 'singleton', ...DEFAULT_CLIENTS_PAGE, ...updateData },
        update: updateData
      });

      let industries = [];
      let clientBrands = [];
      let reviews = [];
      try { industries = JSON.parse(updated.industriesList); } catch {}
      try { clientBrands = JSON.parse(updated.clientsList); } catch {}
      try { reviews = JSON.parse(updated.reviewsList); } catch {}

      return res.json({
        success: true,
        data: {
          ...updated,
          industries,
          clientBrands,
          reviews
        },
        message: 'Clients page updated successfully'
      });
    }

    // Raw SQL update fallback
    const updateEntries = Object.entries(updateData);
    if (updateEntries.length > 0) {
      const setClause = updateEntries.map(([k, v]) => `"${k}" = '${String(v).replace(/'/g, "''")}'`).join(', ') + ', "updatedAt" = NOW()';
      await prisma.$executeRawUnsafe(`UPDATE "ClientsPage" SET ${setClause} WHERE id = 'singleton'`);
    }

    const rows = await prisma.$queryRawUnsafe('SELECT * FROM "ClientsPage" WHERE id = \'singleton\' LIMIT 1');
    const updated = rows[0] || DEFAULT_CLIENTS_PAGE;

    let industries = [];
    let clientBrands = [];
    let reviews = [];
    try { industries = JSON.parse(updated.industriesList); } catch {}
    try { clientBrands = JSON.parse(updated.clientsList); } catch {}
    try { reviews = JSON.parse(updated.reviewsList); } catch {}

    res.json({
      success: true,
      data: {
        ...updated,
        industries,
        clientBrands,
        reviews
      },
      message: 'Clients page updated successfully'
    });
  } catch (error) {
    console.error('Error in updateClientsPage:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
