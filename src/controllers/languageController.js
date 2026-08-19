const prisma = require('../config/db');

// Helper to sanitize/parse JSON fields
const parseJsonField = (field) => {
  if (!field) return null;
  if (typeof field === 'object') return field;
  try {
    return JSON.parse(field);
  } catch (e) {
    return field;
  }
};

// Format a language record to ensure JSON fields are parsed objects
const formatLanguage = (l) => {
  if (!l) return null;
  return {
    ...l,
    contentOverrides: parseJsonField(l.contentOverrides),
    faqs: parseJsonField(l.faqs),
    reviews: parseJsonField(l.reviews),
    pricing: parseJsonField(l.pricing)
  };
};

// Get active languages (public)
const getLanguages = async (req, res) => {
  try {
    const isAll = req.query.all === 'true';
    let raw;
    if (isAll) {
      raw = await prisma.$queryRawUnsafe('SELECT * FROM "Language" ORDER BY "name" ASC');
    } else {
      raw = await prisma.$queryRawUnsafe('SELECT * FROM "Language" WHERE "isActive" = true ORDER BY "name" ASC');
    }
    res.status(200).json({ success: true, data: raw.map(formatLanguage) });
  } catch (error) {
    console.error('getLanguages error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching languages.' });
  }
};

// Get all languages including inactive (admin)
const getAllLanguages = async (req, res) => {
  try {
    const raw = await prisma.$queryRawUnsafe('SELECT * FROM "Language" ORDER BY "name" ASC');
    res.status(200).json({ success: true, data: raw.map(formatLanguage) });
  } catch (error) {
    console.error('getAllLanguages error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching languages.' });
  }
};

// Get single language by key or ID (public)
const getLanguageByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const rows = await prisma.$queryRawUnsafe(
      'SELECT * FROM "Language" WHERE "key" = $1 OR "id" = $1 OR LOWER("key") = LOWER($1) OR LOWER("name") = LOWER($1) LIMIT 1',
      key
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Language not found.' });
    }

    res.status(200).json({ success: true, data: formatLanguage(rows[0]) });
  } catch (error) {
    console.error('getLanguageByKey error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching language details.' });
  }
};

// Create a new language
const createLanguage = async (req, res) => {
  try {
    const {
      key, name, flag, native, cat, speakers, region, difficulty, script, price,
      metaTitle, metaDesc, metaKeywords, ogImage,
      contentOverrides, faqs, reviews, pricing, isActive
    } = req.body;

    if (!key || !name || !flag) {
      return res.status(400).json({ success: false, message: 'Key, name, and flag are required.' });
    }

    const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const existing = await prisma.$queryRawUnsafe('SELECT "id" FROM "Language" WHERE "key" = $1 LIMIT 1', cleanKey);
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Language with this key/slug already exists.' });
    }

    const sql = `
      INSERT INTO "Language" (
        "id", "key", "name", "flag", "native", "cat", "speakers", "region", "difficulty", "script",
        "price", "metaTitle", "metaDesc", "metaKeywords", "ogImage", "contentOverrides", "faqs", "reviews", "pricing", "isActive", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15::jsonb, $16::jsonb, $17::jsonb, $18::jsonb, $19, NOW(), NOW()
      )
      RETURNING *
    `;

    const insertedRows = await prisma.$queryRawUnsafe(
      sql,
      cleanKey,
      name.trim(),
      flag.trim(),
      native || null,
      cat || 'General',
      speakers || null,
      region || null,
      difficulty || null,
      script || null,
      price ? parseFloat(price) : null,
      metaTitle || null,
      metaDesc || null,
      metaKeywords || null,
      ogImage || null,
      contentOverrides ? JSON.stringify(contentOverrides) : null,
      faqs ? JSON.stringify(faqs) : null,
      reviews ? JSON.stringify(reviews) : null,
      pricing ? JSON.stringify(pricing) : null,
      isActive !== undefined ? Boolean(isActive) : true
    );

    res.status(201).json({ success: true, data: formatLanguage(insertedRows[0]) });
  } catch (error) {
    console.error('createLanguage error:', error);
    res.status(500).json({ success: false, message: 'Server error creating language.' });
  }
};

// Update a language
const updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, flag, native, cat, speakers, region, difficulty, script, price,
      metaTitle, metaDesc, metaKeywords, ogImage,
      contentOverrides, faqs, reviews, pricing, isActive
    } = req.body;

    const existingRows = await prisma.$queryRawUnsafe(
      'SELECT * FROM "Language" WHERE "id" = $1 OR "key" = $1 LIMIT 1',
      id
    );

    if (!existingRows || existingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Language not found.' });
    }

    const existing = existingRows[0];

    const sql = `
      UPDATE "Language"
      SET 
        "name" = $1,
        "flag" = $2,
        "native" = $3,
        "cat" = $4,
        "speakers" = $5,
        "region" = $6,
        "difficulty" = $7,
        "script" = $8,
        "price" = $9,
        "metaTitle" = $10,
        "metaDesc" = $11,
        "metaKeywords" = $12,
        "ogImage" = $13,
        "contentOverrides" = $14::jsonb,
        "faqs" = $15::jsonb,
        "reviews" = $16::jsonb,
        "pricing" = $17::jsonb,
        "isActive" = $18,
        "updatedAt" = NOW()
      WHERE "id" = $19
      RETURNING *
    `;

    const updatedRows = await prisma.$queryRawUnsafe(
      sql,
      name !== undefined ? name.trim() : existing.name,
      flag !== undefined ? flag.trim() : existing.flag,
      native !== undefined ? native : existing.native,
      cat !== undefined ? cat : existing.cat,
      speakers !== undefined ? speakers : existing.speakers,
      region !== undefined ? region : existing.region,
      difficulty !== undefined ? difficulty : existing.difficulty,
      script !== undefined ? script : existing.script,
      price !== undefined ? (price !== null && price !== '' ? parseFloat(price) : null) : existing.price,
      metaTitle !== undefined ? metaTitle : existing.metaTitle,
      metaDesc !== undefined ? metaDesc : existing.metaDesc,
      metaKeywords !== undefined ? metaKeywords : existing.metaKeywords,
      ogImage !== undefined ? ogImage : existing.ogImage,
      contentOverrides !== undefined ? JSON.stringify(contentOverrides) : (existing.contentOverrides ? JSON.stringify(existing.contentOverrides) : null),
      faqs !== undefined ? JSON.stringify(faqs) : (existing.faqs ? JSON.stringify(existing.faqs) : null),
      reviews !== undefined ? JSON.stringify(reviews) : (existing.reviews ? JSON.stringify(existing.reviews) : null),
      pricing !== undefined ? JSON.stringify(pricing) : (existing.pricing ? JSON.stringify(existing.pricing) : null),
      isActive !== undefined ? Boolean(isActive) : existing.isActive,
      existing.id
    );

    res.status(200).json({ success: true, data: formatLanguage(updatedRows[0]) });
  } catch (error) {
    console.error('updateLanguage error:', error);
    res.status(500).json({ success: false, message: 'Server error updating language.' });
  }
};

// Delete a language
const deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingRows = await prisma.$queryRawUnsafe(
      'SELECT "id" FROM "Language" WHERE "id" = $1 OR "key" = $1 LIMIT 1',
      id
    );

    if (!existingRows || existingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Language not found.' });
    }

    await prisma.$queryRawUnsafe('DELETE FROM "Language" WHERE "id" = $1', existingRows[0].id);
    res.status(200).json({ success: true, message: 'Language deleted successfully.' });
  } catch (error) {
    console.error('deleteLanguage error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting language.' });
  }
};

module.exports = {
  getLanguages,
  getAllLanguages,
  getLanguageByKey,
  createLanguage,
  updateLanguage,
  deleteLanguage
};
