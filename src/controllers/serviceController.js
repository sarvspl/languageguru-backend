const prisma = require('../config/db');

const getServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching services.' });
  }
};

const createService = async (req, res) => {
  try {
    const { key, name, icon, short, price, fast, label, tag, title, alt, p1, p2, features, docs, ctaLabel, ctaKey, description } = req.body;
    if (!key || !name || !icon) {
      return res.status(400).json({ success: false, message: 'Key, name, and icon are required.' });
    }

    const existing = await prisma.service.findUnique({ where: { key } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Service with this key already exists.' });
    }

    const service = await prisma.service.create({
      data: { key, name, icon, short, price, fast, label, tag, title, alt, p1, p2, features: features || [], docs: docs || [], ctaLabel, ctaKey, description }
    });
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating service.' });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, short, price, fast, label, tag, title, alt, p1, p2, features, docs, ctaLabel, ctaKey, description } = req.body;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    const dataToUpdate = { name, icon, short, price, fast, label, tag, title, alt, p1, p2, ctaLabel, ctaKey, description };
    if (features !== undefined) dataToUpdate.features = features;
    if (docs !== undefined) dataToUpdate.docs = docs;

    const service = await prisma.service.update({
      where: { id },
      data: dataToUpdate
    });
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating service.' });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    await prisma.service.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Service deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting service.' });
  }
};

module.exports = { getServices, createService, updateService, deleteService };
