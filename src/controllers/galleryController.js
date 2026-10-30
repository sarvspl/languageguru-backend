const prisma = require('../config/db');
const { randomUUID } = require('crypto');

// Get all gallery items (public - active only)
const getGallery = async (req, res) => {
  try {
    const items = await prisma.$queryRaw`
      SELECT * FROM "GalleryItem"
      WHERE "isActive" = true
      ORDER BY "createdAt" ASC
    `;
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error('getGallery error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching gallery.' });
  }
};

// Get ALL gallery items (admin — includes inactive)
const getAllGallery = async (req, res) => {
  try {
    const items = await prisma.$queryRaw`
      SELECT * FROM "GalleryItem"
      ORDER BY "createdAt" ASC
    `;
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error('getAllGallery error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching gallery.' });
  }
};

// Create a gallery item
const createGalleryItem = async (req, res) => {
  try {
    const {
      doc, lang, flag, langKey, time, icon, seal, acc, cat,
      imageUrl, sampleFileUrl, price, service, serviceKey, city, cityKey, isActive
    } = req.body;

    if (!doc || !lang) {
      return res.status(400).json({ success: false, message: 'doc and lang are required.' });
    }

    const id = randomUUID();
    const finalFlag = flag || '🏳️';
    const finalLangKey = langKey ? langKey.toLowerCase().trim() : (lang.split('→').pop() || lang).toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const finalTime = time || '24 Hrs';
    const finalIcon = icon || '📜';
    const finalSeal = seal || finalFlag;
    const finalCat = cat || 'General';
    const activeVal = isActive !== false;
    const now = new Date();

    await prisma.$executeRaw`
      INSERT INTO "GalleryItem" (
        "id", "doc", "lang", "flag", "langKey", "time", "icon", "seal", "acc", "cat",
        "imageUrl", "sampleFileUrl", "price", "service", "serviceKey", "city", "cityKey",
        "isActive", "createdAt", "updatedAt"
      ) VALUES (
        ${id}, ${doc.trim()}, ${lang.trim()}, ${finalFlag}, ${finalLangKey}, ${finalTime},
        ${finalIcon}, ${finalSeal}, ${acc || null}, ${finalCat},
        ${imageUrl || null}, ${sampleFileUrl || null}, ${price || null},
        ${service || null}, ${serviceKey || null}, ${city || null}, ${cityKey || null},
        ${activeVal}, ${now}, ${now}
      )
    `;

    const [created] = await prisma.$queryRaw`SELECT * FROM "GalleryItem" WHERE "id" = ${id}`;
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('createGalleryItem error:', error);
    res.status(500).json({ success: false, message: 'Server error creating gallery item.' });
  }
};

// Update a gallery item
const updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.$queryRaw`SELECT * FROM "GalleryItem" WHERE "id" = ${id}`;
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Gallery item not found.' });
    }
    const curr = existing[0];

    const {
      doc, lang, flag, langKey, time, icon, seal, acc, cat,
      imageUrl, sampleFileUrl, price, service, serviceKey, city, cityKey, isActive
    } = req.body;

    const finalDoc = doc !== undefined ? doc.trim() : curr.doc;
    const finalLang = lang !== undefined ? lang.trim() : curr.lang;
    const finalFlag = flag !== undefined ? flag : curr.flag;
    const finalLangKey = langKey !== undefined ? langKey.toLowerCase().trim() : curr.langKey;
    const finalTime = time !== undefined ? time : curr.time;
    const finalIcon = icon !== undefined ? icon : curr.icon;
    const finalSeal = seal !== undefined ? seal : curr.seal;
    const finalAcc = acc !== undefined ? acc : curr.acc;
    const finalCat = cat !== undefined ? cat : curr.cat;
    const finalImageUrl = imageUrl !== undefined ? imageUrl : curr.imageUrl;
    const finalSampleFileUrl = sampleFileUrl !== undefined ? sampleFileUrl : curr.sampleFileUrl;
    const finalPrice = price !== undefined ? price : curr.price;
    const finalService = service !== undefined ? service : curr.service;
    const finalServiceKey = serviceKey !== undefined ? serviceKey : curr.serviceKey;
    const finalCity = city !== undefined ? city : curr.city;
    const finalCityKey = cityKey !== undefined ? cityKey : curr.cityKey;
    const finalIsActive = isActive !== undefined ? isActive : curr.isActive;
    const now = new Date();

    await prisma.$executeRaw`
      UPDATE "GalleryItem" SET
        "doc" = ${finalDoc},
        "lang" = ${finalLang},
        "flag" = ${finalFlag},
        "langKey" = ${finalLangKey},
        "time" = ${finalTime},
        "icon" = ${finalIcon},
        "seal" = ${finalSeal},
        "acc" = ${finalAcc},
        "cat" = ${finalCat},
        "imageUrl" = ${finalImageUrl},
        "sampleFileUrl" = ${finalSampleFileUrl},
        "price" = ${finalPrice},
        "service" = ${finalService},
        "serviceKey" = ${finalServiceKey},
        "city" = ${finalCity},
        "cityKey" = ${finalCityKey},
        "isActive" = ${finalIsActive},
        "updatedAt" = ${now}
      WHERE "id" = ${id}
    `;

    const [updated] = await prisma.$queryRaw`SELECT * FROM "GalleryItem" WHERE "id" = ${id}`;
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('updateGalleryItem error:', error);
    res.status(500).json({ success: false, message: 'Server error updating gallery item.' });
  }
};

// Delete a gallery item
const deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.$queryRaw`SELECT * FROM "GalleryItem" WHERE "id" = ${id}`;
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Gallery item not found.' });
    }

    await prisma.$executeRaw`DELETE FROM "GalleryItem" WHERE "id" = ${id}`;
    res.status(200).json({ success: true, message: 'Gallery item deleted successfully.' });
  } catch (error) {
    console.error('deleteGalleryItem error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting gallery item.' });
  }
};

module.exports = { getGallery, getAllGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem };
