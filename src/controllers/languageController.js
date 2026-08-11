const prisma = require('../config/db');

// Get all languages
const getLanguages = async (req, res) => {
  try {
    const languages = await prisma.language.findMany({
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ success: true, data: languages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching languages.' });
  }
};

// Create a new language
const createLanguage = async (req, res) => {
  try {
    const { key, name, flag, native, cat, speakers, region, difficulty, script, price, isActive } = req.body;
    if (!key || !name || !flag) {
      return res.status(400).json({ success: false, message: 'Key, name, and flag are required.' });
    }

    const existing = await prisma.language.findUnique({ where: { key } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Language with this key already exists.' });
    }

    const language = await prisma.language.create({
      data: { key, name, flag, native, cat, speakers, region, difficulty, script, price, isActive }
    });
    res.status(201).json({ success: true, data: language });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating language.' });
  }
};

// Update a language
const updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, flag, native, cat, speakers, region, difficulty, script, price, isActive } = req.body;

    const existing = await prisma.language.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Language not found.' });
    }

    const language = await prisma.language.update({
      where: { id },
      data: { name, flag, native, cat, speakers, region, difficulty, script, price, isActive }
    });
    res.status(200).json({ success: true, data: language });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating language.' });
  }
};

// Delete a language
const deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await prisma.language.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Language not found.' });
    }

    await prisma.language.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Language deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting language.' });
  }
};

module.exports = { getLanguages, createLanguage, updateLanguage, deleteLanguage };
