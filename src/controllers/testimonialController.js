const prisma = require('../config/db');

// Get active testimonials (public)
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Get all testimonials
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    console.error('Error fetching all testimonials:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Create testimonial
exports.createTestimonial = async (req, res) => {
  try {
    const { name, city, role, text, rating, isActive, sortOrder } = req.body;
    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        city,
        role,
        text,
        rating: rating ? parseInt(rating) : 5,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0
      }
    });
    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Update testimonial
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, role, text, rating, isActive, sortOrder } = req.body;

    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        city: city !== undefined ? city : existing.city,
        role: role !== undefined ? role : existing.role,
        text: text !== undefined ? text : existing.text,
        rating: rating !== undefined ? parseInt(rating) : existing.rating,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : existing.sortOrder
      }
    });
    res.json({ success: true, data: testimonial });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Delete testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Testimonial not found' });

    await prisma.testimonial.delete({ where: { id } });
    res.json({ success: true, message: 'Testimonial deleted successfully.' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
