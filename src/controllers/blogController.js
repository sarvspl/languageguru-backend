const prisma = require('../config/db');

// Helper to generate a clean URL slug from a title string
const slugify = (text) => {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // remove non-alphanumeric except hyphen/space
    .replace(/[\s_-]+/g, '-')     // replace spaces & underscores with single hyphen
    .replace(/^-+|-+$/g, '');     // trim leading/trailing hyphens
};

// Helper to ensure a unique slug in the database
const getUniqueSlug = async (rawSlug, excludeId = null) => {
  let baseSlug = slugify(rawSlug) || 'untitled-post';
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

// Helper to calculate estimated reading time
const calculateReadTime = (content) => {
  if (!content) return '3 min read';
  const textOnly = content.replace(/<[^>]*>?/gm, ' ');
  const words = textOnly.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min read`;
};

// ─── PUBLIC ENDPOINTS ────────────────────────────────────────────────────────

/**
 * GET /api/v1/blogs
 * Public listing of published articles with optional category filter, search & pagination.
 */
exports.getPublishedBlogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 9));
    const skip = (page - 1) * limit;

    const { category, search } = req.query;

    const where = {
      isPublished: true
    };

    if (category && category !== 'All') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { excerpt: { contains: search.trim(), mode: 'insensitive' } },
        { content: { contains: search.trim(), mode: 'insensitive' } }
      ];
    }

    const [total, blogs, allCategories] = await Promise.all([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          coverImage: true,
          author: true,
          readTime: true,
          publishedAt: true,
          createdAt: true
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { category: true },
        distinct: ['category']
      })
    ]);

    const categories = ['All', ...allCategories.map((c) => c.category).filter(Boolean)];

    return res.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      categories,
      data: blogs
    });
  } catch (error) {
    console.error('Error fetching published blogs:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * GET /api/v1/blogs/:slug
 * Public article detail page by slug.
 */
exports.getBlogBySlug = async (req, res) => {
  try {
    const rawSlug = (req.params.slug || '').trim();
    const cleanSlug = rawSlug.toLowerCase();

    // 1. First try exact clean slug
    let blog = await prisma.blogPost.findUnique({
      where: { slug: cleanSlug }
    });

    // 2. If not found, try case-insensitive query or original raw slug
    if (!blog) {
      blog = await prisma.blogPost.findFirst({
        where: {
          OR: [
            { slug: { equals: rawSlug, mode: 'insensitive' } },
            { title: { equals: rawSlug, mode: 'insensitive' } }
          ]
        }
      });
    }

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Only allow public viewing if published, unless admin passes preview flag
    if (!blog.isPublished && !req.query.preview) {
      return res.status(404).json({ success: false, message: 'Article not published' });
    }

    // Fetch up to 3 related articles from the same category
    const related = await prisma.blogPost.findMany({
      where: {
        category: blog.category,
        id: { not: blog.id },
        isPublished: true
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        coverImage: true,
        author: true,
        readTime: true,
        publishedAt: true
      },
      orderBy: { publishedAt: 'desc' },
      take: 3
    });

    return res.json({
      success: true,
      data: blog,
      related
    });
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─── ADMIN ENDPOINTS ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/blogs/admin/all
 * Full list for Admin dashboard with metrics (drafts, published, categories).
 */
exports.getAllAdminBlogs = async (req, res) => {
  try {
    const { status, category, search } = req.query;

    const where = {};

    if (status === 'published') {
      where.isPublished = true;
    } else if (status === 'draft') {
      where.isPublished = false;
    }

    if (category && category !== 'All') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { slug: { contains: search.trim(), mode: 'insensitive' } },
        { author: { contains: search.trim(), mode: 'insensitive' } }
      ];
    }

    const [blogs, total, published, drafts, categoryList] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { isPublished: true } }),
      prisma.blogPost.count({ where: { isPublished: false } }),
      prisma.blogPost.findMany({
        select: { category: true },
        distinct: ['category']
      })
    ]);

    const categories = categoryList.map((c) => c.category).filter(Boolean);

    return res.json({
      success: true,
      counts: {
        total,
        published,
        drafts,
        categories: categories.length
      },
      categories: ['All', ...categories],
      data: blogs
    });
  } catch (error) {
    console.error('Error in getAllAdminBlogs:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * GET /api/v1/blogs/admin/:id
 * Single article data for admin editor.
 */
exports.getAdminBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await prisma.blogPost.findUnique({ where: { id } });

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    return res.json({ success: true, data: blog });
  } catch (error) {
    console.error('Error fetching blog by ID:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * POST /api/v1/blogs
 * Create new blog article.
 */
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      coverImage,
      author,
      readTime,
      metaTitle,
      metaDesc,
      metaKeywords,
      ogTitle,
      ogDesc,
      ogImage,
      shareWhatsApp,
      shareLinkedIn,
      shareTwitter,
      isPublished
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content body is required' });
    }

    const finalSlug = await getUniqueSlug(slug || title);
    const finalReadTime = (readTime && readTime.trim()) ? readTime.trim() : calculateReadTime(content);
    const published = isPublished !== undefined ? Boolean(isPublished) : true;

    const blog = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt ? excerpt.trim() : title.trim(),
        content: content.trim(),
        category: (category && category.trim()) || 'Translation',
        coverImage: coverImage ? coverImage.trim() : null,
        author: (author && author.trim()) || 'Language Guru Editorial Team',
        readTime: finalReadTime,
        metaTitle: metaTitle ? metaTitle.trim() : title.trim(),
        metaDesc: metaDesc ? metaDesc.trim() : (excerpt ? excerpt.trim() : title.trim()),
        metaKeywords: metaKeywords ? metaKeywords.trim() : null,
        ogTitle: ogTitle ? ogTitle.trim() : (metaTitle ? metaTitle.trim() : title.trim()),
        ogDesc: ogDesc ? ogDesc.trim() : (metaDesc ? metaDesc.trim() : (excerpt ? excerpt.trim() : title.trim())),
        ogImage: ogImage ? ogImage.trim() : (coverImage ? coverImage.trim() : null),
        shareWhatsApp: shareWhatsApp ? shareWhatsApp.trim() : null,
        shareLinkedIn: shareLinkedIn ? shareLinkedIn.trim() : null,
        shareTwitter: shareTwitter ? shareTwitter.trim() : null,
        isPublished: published,
        publishedAt: published ? new Date() : null
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: blog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

/**
 * PUT /api/v1/blogs/:id
 * Update existing article.
 */
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      coverImage,
      author,
      readTime,
      metaTitle,
      metaDesc,
      metaKeywords,
      ogTitle,
      ogDesc,
      ogImage,
      shareWhatsApp,
      shareLinkedIn,
      shareTwitter,
      isPublished
    } = req.body;

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    let finalSlug = existing.slug;
    if (slug && slug !== existing.slug) {
      finalSlug = await getUniqueSlug(slug, id);
    } else if (!slug && title && title !== existing.title) {
      finalSlug = await getUniqueSlug(title, id);
    }

    const finalContent = content !== undefined ? content : existing.content;
    const finalReadTime = readTime !== undefined ? readTime : calculateReadTime(finalContent);

    let publishedAt = existing.publishedAt;
    if (isPublished !== undefined && Boolean(isPublished) && !existing.publishedAt) {
      publishedAt = new Date();
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        slug: finalSlug,
        excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
        content: finalContent,
        category: category !== undefined ? category.trim() : existing.category,
        coverImage: coverImage !== undefined ? coverImage : existing.coverImage,
        author: author !== undefined ? author.trim() : existing.author,
        readTime: finalReadTime,
        metaTitle: metaTitle !== undefined ? metaTitle : existing.metaTitle,
        metaDesc: metaDesc !== undefined ? metaDesc : existing.metaDesc,
        metaKeywords: metaKeywords !== undefined ? metaKeywords : existing.metaKeywords,
        ogTitle: ogTitle !== undefined ? (ogTitle ? ogTitle.trim() : null) : existing.ogTitle,
        ogDesc: ogDesc !== undefined ? (ogDesc ? ogDesc.trim() : null) : existing.ogDesc,
        ogImage: ogImage !== undefined ? (ogImage ? ogImage.trim() : null) : existing.ogImage,
        shareWhatsApp: shareWhatsApp !== undefined ? (shareWhatsApp ? shareWhatsApp.trim() : null) : existing.shareWhatsApp,
        shareLinkedIn: shareLinkedIn !== undefined ? (shareLinkedIn ? shareLinkedIn.trim() : null) : existing.shareLinkedIn,
        shareTwitter: shareTwitter !== undefined ? (shareTwitter ? shareTwitter.trim() : null) : existing.shareTwitter,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : existing.isPublished,
        publishedAt
      }
    });

    return res.json({
      success: true,
      message: 'Article updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

/**
 * DELETE /api/v1/blogs/:id
 * Delete article.
 */
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.blogPost.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    await prisma.blogPost.delete({ where: { id } });

    return res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * PATCH /api/v1/blogs/:id/toggle
 * Toggle publish/draft status.
 */
exports.toggleBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.blogPost.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const nextState = !existing.isPublished;
    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        isPublished: nextState,
        publishedAt: nextState ? (existing.publishedAt || new Date()) : existing.publishedAt
      }
    });

    return res.json({
      success: true,
      message: nextState ? 'Article published' : 'Article moved to drafts',
      isPublished: nextState,
      data: updated
    });
  } catch (error) {
    console.error('Error toggling blog status:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
