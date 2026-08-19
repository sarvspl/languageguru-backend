const prisma = require('../config/db');

const getHomeSections = async (req, res) => {
  try {
    const sections = await prisma.homePageSection.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return res.status(200).json({ success: true, data: sections });
  } catch (error) {
    console.error('getHomeSections error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getHomeSectionById = async (req, res) => {
  try {
    const section = await prisma.homePageSection.findUnique({
      where: { id: req.params.id },
    });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    return res.status(200).json({ success: true, data: section });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createHomeSection = async (req, res) => {
  try {
    const { sectionId, tag, title, content, imageUrl, layout, buttonText, buttonLink, isActive, sortOrder, stat1Value, stat1Label, stat2Value, stat2Label } = req.body;
    const newSection = await prisma.homePageSection.create({
      data: { sectionId, tag, title, content, imageUrl, layout, buttonText, buttonLink, stat1Value, stat1Label, stat2Value, stat2Label, isActive, sortOrder: sortOrder || 0 },
    });
    return res.status(201).json({ success: true, data: newSection, message: 'Section created successfully' });
  } catch (error) {
    console.error('createHomeSection error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create section' });
  }
};

const updateHomeSection = async (req, res) => {
  try {
    const { sectionId, tag, title, content, imageUrl, layout, buttonText, buttonLink, isActive, sortOrder, stat1Value, stat1Label, stat2Value, stat2Label } = req.body;
    const updated = await prisma.homePageSection.update({
      where: { id: req.params.id },
      data: { sectionId, tag, title, content, imageUrl, layout, buttonText, buttonLink, stat1Value, stat1Label, stat2Value, stat2Label, isActive, sortOrder },
    });
    return res.status(200).json({ success: true, data: updated, message: 'Section updated successfully' });
  } catch (error) {
    console.error('updateHomeSection error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update section' });
  }
};

const deleteHomeSection = async (req, res) => {
  try {
    await prisma.homePageSection.delete({
      where: { id: req.params.id },
    });
    return res.status(200).json({ success: true, message: 'Section deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete section' });
  }
};

const reorderHomeSections = async (req, res) => {
  try {
    const { items } = req.body; 
    const updates = items.map(item => 
      prisma.homePageSection.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder }
      })
    );
    await prisma.$transaction(updates);
    return res.status(200).json({ success: true, message: 'Sections reordered' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Reorder failed' });
  }
};

module.exports = { getHomeSections, getHomeSectionById, createHomeSection, updateHomeSection, deleteHomeSection, reorderHomeSections };
