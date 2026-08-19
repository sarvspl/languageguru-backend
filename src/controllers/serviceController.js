const prisma = require('../config/db');

// Get all services
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

// Get all services including inactive (admin)
const getAllServices = async (req, res) => {
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
    const { key, name, icon, short, price, fast, label, tag, title, alt, p1, p2, features, docs, ctaLabel, ctaKey, description, certLang, certDoc, certFlag, certAcc, certTime, certIcon, metaTitle, metaDesc, faqs, reviews, contentOverrides } = req.body;

    if (!key || !name) {
      return res.status(400).json({ success: false, message: 'Key and name are required.' });
    }

    const existing = await prisma.service.findUnique({ where: { key } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Service key already exists.' });
    }

    const service = await prisma.service.create({
      data: {
        key, name, icon, short: description || short, price, fast, label, tag, title, alt, p1, p2, ctaLabel, ctaKey, description,
        features: features || [],
        docs: docs || [],
        certLang, certDoc, certFlag, certAcc, certTime, certIcon, metaTitle, metaDesc, faqs, reviews,
        contentOverrides: contentOverrides || {}
      }
    });
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ success: false, message: 'Server error creating service.' });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, short, price, fast, label, tag, title, alt, p1, p2, features, docs, ctaLabel, ctaKey, description, certLang, certDoc, certFlag, certAcc, certTime, certIcon, metaTitle, metaDesc, faqs, reviews, contentOverrides } = req.body;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    const dataToUpdate = {
      name,
      icon,
      short: description || short,
      price,
      fast,
      label,
      tag,
      title,
      alt,
      p1,
      p2,
      ctaLabel,
      ctaKey,
      description,
      certLang,
      certDoc,
      certFlag,
      certAcc,
      certTime,
      certIcon,
      metaTitle,
      metaDesc,
      faqs,
      reviews,
      contentOverrides: contentOverrides !== undefined ? contentOverrides : existing.contentOverrides
    };
    if (features !== undefined) dataToUpdate.features = features;
    if (docs !== undefined) dataToUpdate.docs = docs;

    const service = await prisma.service.update({
      where: { id },
      data: dataToUpdate
    });
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    console.error('Error updating service:', error);
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

module.exports = { getServices, getAllServices, createService, updateService, deleteService };
