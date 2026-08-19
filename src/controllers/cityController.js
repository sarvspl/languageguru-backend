const prisma = require('../config/db');
const { validateSlug, slugify } = require('../config/slug');

// BUG-10: the public endpoint returns published cities only, so a city can be
// taken off the site by deactivating it instead of deleting it permanently.
const getCities = async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    console.error('getCities error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching cities.' });
  }
};

// Admin: every city, including deactivated ones.
const getAllCities = async (req, res) => {
  try {
    const cities = await prisma.city.findMany({ orderBy: { name: 'asc' } });
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    console.error('getAllCities error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching cities.' });
  }
};

const createCity = async (req, res) => {
  try {
    const { key, name, ic, state, isMetro, isActive, metaTitle, metaDesc, contentOverrides, faqs, reviews } = req.body;
    if (!key || !name) {
      return res.status(400).json({ success: false, message: 'Key and name are required.' });
    }

    const existing = await prisma.city.findUnique({ where: { key } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'City with this key already exists.' });
    }

    // The URL slug defaults to the immutable key and can be changed later.
    const slugCheck = await validateSlug({ model: 'city', raw: req.body.slug || key });
    if (!slugCheck.ok) {
      return res.status(slugCheck.status).json({ success: false, message: slugCheck.message });
    }

    const city = await prisma.city.create({
      data: { key, name, ic, state, isMetro, isActive: isActive !== undefined ? isActive : true, metaTitle, metaDesc, contentOverrides, faqs, reviews, slug: slugCheck.slug }
    });
    res.status(201).json({ success: true, data: city });
  } catch (error) {
    console.error('createCity error:', error);
    res.status(500).json({ success: false, message: 'Server error creating city.' });
  }
};

const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, ic, state, isMetro, isActive, metaTitle, metaDesc, contentOverrides, faqs, reviews } = req.body;

    const existing = await prisma.city.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }

    const data = { name, ic, state, isMetro, metaTitle, metaDesc };
    if (isActive !== undefined) data.isActive = isActive;
    if (contentOverrides !== undefined) data.contentOverrides = contentOverrides;
    if (faqs !== undefined) data.faqs = faqs;
    if (reviews !== undefined) data.reviews = reviews;

    // A submitted slug is validated; an absent one leaves the current URL alone.
    if (req.body.slug !== undefined) {
      const slugCheck = await validateSlug({ model: 'city', raw: req.body.slug, id });
      if (!slugCheck.ok) {
        return res.status(slugCheck.status).json({ success: false, message: slugCheck.message });
      }
      data.slug = slugCheck.slug;
    }

    const city = await prisma.city.update({ where: { id }, data });
    res.status(200).json({ success: true, data: city });
  } catch (error) {
    console.error('updateCity error:', error);
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
    console.error('deleteCity error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting city.' });
  }
};

module.exports = { getCities, getAllCities, createCity, updateCity, deleteCity };
