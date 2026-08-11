const prisma = require('../config/db');

// Get all translators (public — active only)
const getTranslators = async (req, res) => {
  try {
    const translators = await prisma.translator.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ success: true, data: translators });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching translators.' });
  }
};

// Get ALL translators (admin — includes inactive)
const getAllTranslators = async (req, res) => {
  try {
    const translators = await prisma.translator.findMany({ orderBy: { name: 'asc' } });
    res.status(200).json({ success: true, data: translators });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching translators.' });
  }
};

// Create a translator
const createTranslator = async (req, res) => {
  try {
    const { name, lang, city, spec, exp, rate, cert, isActive } = req.body;
    if (!name || !lang || !city) {
      return res.status(400).json({ success: false, message: 'name, lang, and city are required.' });
    }
    const translator = await prisma.translator.create({
      data: { name, lang, city, spec, exp, rate, cert, isActive: isActive !== false }
    });
    res.status(201).json({ success: true, data: translator });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating translator.' });
  }
};

// Update a translator
const updateTranslator = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, lang, city, spec, exp, rate, cert, isActive } = req.body;
    const existing = await prisma.translator.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Translator not found.' });

    const translator = await prisma.translator.update({
      where: { id },
      data: { name, lang, city, spec, exp, rate, cert, isActive }
    });
    res.status(200).json({ success: true, data: translator });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating translator.' });
  }
};

// Delete a translator
const deleteTranslator = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.translator.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Translator not found.' });

    await prisma.translator.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Translator deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting translator.' });
  }
};

module.exports = { getTranslators, getAllTranslators, createTranslator, updateTranslator, deleteTranslator };
