const prisma = require('../config/db');

const getCities = async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching cities.' });
  }
};

const createCity = async (req, res) => {
  try {
    const { key, name, ic, state, isMetro } = req.body;
    if (!key || !name) {
      return res.status(400).json({ success: false, message: 'Key and name are required.' });
    }

    const existing = await prisma.city.findUnique({ where: { key } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'City with this key already exists.' });
    }

    const city = await prisma.city.create({
      data: { key, name, ic, state, isMetro }
    });
    res.status(201).json({ success: true, data: city });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating city.' });
  }
};

const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, ic, state, isMetro } = req.body;

    const existing = await prisma.city.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }

    const city = await prisma.city.update({
      where: { id },
      data: { name, ic, state, isMetro }
    });
    res.status(200).json({ success: true, data: city });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating city.' });
  }
};

const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await prisma.city.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }

    await prisma.city.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'City deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting city.' });
  }
};

module.exports = { getCities, createCity, updateCity, deleteCity };
