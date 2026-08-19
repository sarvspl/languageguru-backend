const prisma = require('../config/db');

// Get all active industries (public)
exports.getIndustries = async (req, res) => {
  try {
    const industries = await prisma.industry.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, data: industries });
  } catch (error) {
    console.error('Error fetching industries:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Get all industries (including inactive)
exports.getAllIndustries = async (req, res) => {
  try {
    const industries = await prisma.industry.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: industries });
  } catch (error) {
    console.error('Error fetching all industries:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Add new industry
exports.createIndustry = async (req, res) => {
  try {
    const { icon, name, desc, svc, isActive } = req.body;
    
    // Check if name already exists
    const existing = await prisma.industry.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Industry name already exists' });
    }

    const industry = await prisma.industry.create({
      data: {
        icon,
        name,
        desc,
        svc,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    res.status(201).json({ success: true, data: industry });
  } catch (error) {
    console.error('Error creating industry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Update industry
exports.updateIndustry = async (req, res) => {
  try {
    const { id } = req.params;
    const { icon, name, desc, svc, isActive } = req.body;

    const existing = await prisma.industry.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Industry not found' });
    }

    const industry = await prisma.industry.update({
      where: { id },
      data: {
        icon: icon !== undefined ? icon : existing.icon,
        name: name !== undefined ? name : existing.name,
        desc: desc !== undefined ? desc : existing.desc,
        svc: svc !== undefined ? svc : existing.svc,
        isActive: isActive !== undefined ? isActive : existing.isActive
      }
    });
    res.json({ success: true, data: industry });
  } catch (error) {
    console.error('Error updating industry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Delete industry
exports.deleteIndustry = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.industry.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Industry not found' });

    await prisma.industry.delete({ where: { id } });
    res.json({ success: true, message: 'Industry deleted successfully.' });
  } catch (error) {
    console.error('Error deleting industry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
