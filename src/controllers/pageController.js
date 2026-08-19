const prisma = require('../config/db');

// Get single page by slug (public)
exports.getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await prisma.page.findUnique({
      where: { slug }
    });
    if (!page || (!page.isActive && !req.user)) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    res.json({ success: true, data: page });
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Get all pages
exports.getAllPages = async (req, res) => {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ success: true, data: pages });
  } catch (error) {
    console.error('Error fetching all pages:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Create page
exports.createPage = async (req, res) => {
  try {
    const { slug, title, content, metaTitle, metaDesc, isActive } = req.body;
    
    const existing = await prisma.page.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Page slug already exists' });
    }

    const page = await prisma.page.create({
      data: {
        slug: slug.toLowerCase().trim(),
        title,
        content,
        metaTitle,
        metaDesc,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    res.status(201).json({ success: true, data: page });
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Update page
exports.updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { slug, title, content, metaTitle, metaDesc, isActive } = req.body;

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        slug: slug !== undefined ? slug.toLowerCase().trim() : existing.slug,
        title: title !== undefined ? title : existing.title,
        content: content !== undefined ? content : existing.content,
        metaTitle: metaTitle !== undefined ? metaTitle : existing.metaTitle,
        metaDesc: metaDesc !== undefined ? metaDesc : existing.metaDesc,
        isActive: isActive !== undefined ? isActive : existing.isActive
      }
    });
    res.json({ success: true, data: page });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Delete page
exports.deletePage = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Page not found' });

    await prisma.page.delete({ where: { id } });
    res.json({ success: true, message: 'Page deleted successfully.' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
