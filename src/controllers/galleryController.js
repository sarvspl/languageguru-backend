const prisma = require('../config/db');

// Get all gallery items (public)
const getGallery = async (req, res) => {
  try {
    const items = await prisma.galleryItem.findMany({
      where: { isActive: true },
      orderBy: { cat: 'asc' }
    });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching gallery.' });
  }
};

// Get ALL gallery items (admin — includes inactive)
const getAllGallery = async (req, res) => {
  try {
    const items = await prisma.galleryItem.findMany({ orderBy: { cat: 'asc' } });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching gallery.' });
  }
};

// Create a gallery item
const createGalleryItem = async (req, res) => {
  try {
    const { doc, lang, flag, langKey, time, icon, seal, acc, cat, isActive } = req.body;
    if (!doc || !lang || !flag) {
      return res.status(400).json({ success: false, message: 'doc, lang, and flag are required.' });
    }
    const item = await prisma.galleryItem.create({
      data: { doc, lang, flag, langKey, time, icon, seal, acc, cat: cat || 'General', isActive: isActive !== false }
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating gallery item.' });
  }
};

// Update a gallery item
const updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { doc, lang, flag, langKey, time, icon, seal, acc, cat, isActive } = req.body;
    const existing = await prisma.galleryItem.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Gallery item not found.' });

    const item = await prisma.galleryItem.update({
      where: { id },
      data: { doc, lang, flag, langKey, time, icon, seal, acc, cat, isActive }
    });
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating gallery item.' });
  }
};

// Delete a gallery item
const deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.galleryItem.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Gallery item not found.' });

    await prisma.galleryItem.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Gallery item deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting gallery item.' });
  }
};

module.exports = { getGallery, getAllGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem };
