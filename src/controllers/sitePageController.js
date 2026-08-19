const prisma = require('../config/db');

const sectionSelect = {
  id: true,
  sectionKey: true,
  kind: true,
  tag: true,
  heading: true,
  subheading: true,
  body: true,
  layout: true,
  imageUrl: true,
  buttonText: true,
  buttonLink: true,
  button2Text: true,
  button2Link: true,
  items: true,
  settings: true,
  sortOrder: true,
  isActive: true,
};

/** Shape a page for the front end: sections keyed by sectionKey plus an ordered list. */
const shape = (page) => {
  const list = (page.sections || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const byKey = {};
  list.forEach((s) => { byKey[s.sectionKey] = s; });
  return { ...page, sections: list, section: byKey };
};

// GET /api/v1/site-pages           → every published page with its published sections
// GET /api/v1/site-pages?key=about → just that one
const getPages = async (req, res) => {
  try {
    const { key, slug } = req.query;
    const where = { isActive: true };
    if (key) where.key = String(key);
    if (slug !== undefined) where.slug = String(slug);

    const pages = await prisma.sitePage.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: { sections: { where: { isActive: true }, select: sectionSelect } },
    });

    return res.status(200).json({ success: true, data: pages.map(shape) });
  } catch (error) {
    console.error('getPages error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching pages.' });
  }
};

// GET /api/v1/site-pages/all → admin: every page, including unpublished
const getAllPages = async (req, res) => {
  try {
    const pages = await prisma.sitePage.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { sections: { orderBy: { sortOrder: 'asc' }, select: sectionSelect } },
    });
    return res.status(200).json({ success: true, data: pages.map(shape) });
  } catch (error) {
    console.error('getAllPages error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching pages.' });
  }
};

// GET /api/v1/site-pages/:key
const getPage = async (req, res) => {
  try {
    const page = await prisma.sitePage.findUnique({
      where: { key: req.params.key },
      include: { sections: { orderBy: { sortOrder: 'asc' }, select: sectionSelect } },
    });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found.' });
    return res.status(200).json({ success: true, data: shape(page) });
  } catch (error) {
    console.error('getPage error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching page.' });
  }
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED = new Set(['api', 'admin', '_next', 'uploads', 'static', 'favicon.ico', 'robots.txt', 'sitemap.xml']);

const normaliseSlug = (raw) => String(raw ?? '').trim().replace(/^\/+|\/+$/g, '').toLowerCase();

// PUT /api/v1/site-pages/:key — page meta, including the admin-editable slug
const updatePage = async (req, res) => {
  try {
    const { key } = req.params;
    const existing = await prisma.sitePage.findUnique({ where: { key } });
    if (!existing) return res.status(404).json({ success: false, message: 'Page not found.' });

    const data = {};
    const passthrough = [
      'title', 'navLabel', 'heroTag', 'heroTitle', 'heroSubtitle', 'heroImage',
      'metaTitle', 'metaDesc', 'metaKeywords', 'ogImage',
    ];
    passthrough.forEach((f) => { if (req.body[f] !== undefined) data[f] = req.body[f]; });

    ['showInNav', 'showInFooter', 'showInSitemap', 'isActive'].forEach((f) => {
      if (req.body[f] !== undefined) data[f] = Boolean(req.body[f]);
    });
    if (req.body.sortOrder !== undefined) data.sortOrder = parseInt(req.body.sortOrder, 10) || 0;

    // Slug is admin-editable, but it becomes a public URL — validate it properly.
    if (req.body.slug !== undefined) {
      const slug = normaliseSlug(req.body.slug);

      // The home page is the only page allowed an empty slug.
      if (slug === '') {
        if (key !== 'home') {
          return res.status(400).json({ success: false, message: 'Slug is required.' });
        }
      } else {
        if (!SLUG_RE.test(slug)) {
          return res.status(400).json({
            success: false,
            message: 'Slug may contain lower-case letters, numbers and single hyphens only (for example "about-us").',
          });
        }
        if (RESERVED.has(slug)) {
          return res.status(400).json({ success: false, message: `"${slug}" is reserved and cannot be used as a slug.` });
        }
        const clash = await prisma.sitePage.findFirst({ where: { slug, NOT: { key } } });
        if (clash) {
          return res.status(409).json({ success: false, message: `The slug "${slug}" is already used by the ${clash.title} page.` });
        }
        const pageClash = await prisma.page.findFirst({ where: { slug } });
        if (pageClash) {
          return res.status(409).json({ success: false, message: `The slug "${slug}" is already used by the content page "${pageClash.title}".` });
        }
      }
      data.slug = slug;
    }

    const page = await prisma.sitePage.update({
      where: { key },
      data,
      include: { sections: { orderBy: { sortOrder: 'asc' }, select: sectionSelect } },
    });
    return res.status(200).json({ success: true, data: shape(page), message: 'Page updated.' });
  } catch (error) {
    if (error && error.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'That slug is already in use.' });
    }
    console.error('updatePage error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating page.' });
  }
};

// ─── Sections ──────────────────────────────────────────────────────────────
const sectionPayload = (body) => {
  const data = {};
  ['kind', 'tag', 'heading', 'subheading', 'body', 'layout', 'imageUrl',
   'buttonText', 'buttonLink', 'button2Text', 'button2Link'].forEach((f) => {
    if (body[f] !== undefined) data[f] = body[f];
  });
  if (body.items !== undefined) data.items = body.items;
  if (body.settings !== undefined) data.settings = body.settings;
  if (body.sortOrder !== undefined) data.sortOrder = parseInt(body.sortOrder, 10) || 0;
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
  return data;
};

// PUT /api/v1/site-pages/:key/sections/:sectionKey — upsert one section
const upsertSection = async (req, res) => {
  try {
    const { key, sectionKey } = req.params;
    const page = await prisma.sitePage.findUnique({ where: { key } });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found.' });

    const data = sectionPayload(req.body);
    const section = await prisma.pageSection.upsert({
      where: { pageKey_sectionKey: { pageKey: key, sectionKey } },
      update: data,
      create: { pageKey: key, sectionKey, kind: data.kind || 'richtext', ...data },
      select: sectionSelect,
    });
    return res.status(200).json({ success: true, data: section, message: 'Section saved.' });
  } catch (error) {
    console.error('upsertSection error:', error);
    return res.status(500).json({ success: false, message: 'Server error saving section.' });
  }
};

// DELETE /api/v1/site-pages/:key/sections/:sectionKey
const deleteSection = async (req, res) => {
  try {
    const { key, sectionKey } = req.params;
    await prisma.pageSection.delete({ where: { pageKey_sectionKey: { pageKey: key, sectionKey } } });
    return res.status(200).json({ success: true, message: 'Section deleted.' });
  } catch (error) {
    if (error && error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Section not found.' });
    }
    console.error('deleteSection error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting section.' });
  }
};

// PUT /api/v1/site-pages/:key/sections — bulk reorder / bulk save
const saveSections = async (req, res) => {
  try {
    const { key } = req.params;
    const sections = Array.isArray(req.body?.sections) ? req.body.sections : null;
    if (!sections) {
      return res.status(400).json({ success: false, message: 'Expected a "sections" array.' });
    }
    const page = await prisma.sitePage.findUnique({ where: { key } });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found.' });

    await prisma.$transaction(
      sections.map((s) => {
        const data = sectionPayload(s);
        return prisma.pageSection.upsert({
          where: { pageKey_sectionKey: { pageKey: key, sectionKey: s.sectionKey } },
          update: data,
          create: { pageKey: key, sectionKey: s.sectionKey, kind: data.kind || 'richtext', ...data },
        });
      })
    );

    const updated = await prisma.sitePage.findUnique({
      where: { key },
      include: { sections: { orderBy: { sortOrder: 'asc' }, select: sectionSelect } },
    });
    return res.status(200).json({ success: true, data: shape(updated), message: `${sections.length} sections saved.` });
  } catch (error) {
    console.error('saveSections error:', error);
    return res.status(500).json({ success: false, message: 'Server error saving sections.' });
  }
};

module.exports = {
  getPages, getAllPages, getPage, updatePage,
  upsertSection, deleteSection, saveSections,
};
