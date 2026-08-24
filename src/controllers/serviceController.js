const prisma = require('../config/db');
const { validateSlug, slugify } = require('../config/slug');

// Get all services
// BUG-10: the public site must only ever see published services, so a service can
// be taken off the site by deactivating it rather than deleting it (which orphans
// the QuoteRequest.serviceKey rows that reference it).
const getServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    console.error('getServices error:', error);
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
    console.error('getAllServices error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching services.' });
  }
};

const createService = async (req, res) => {
  try {
    const { key, name, icon, short, price, fast, label, tag, title, alt, p1, p2, features, docs, ctaLabel, ctaKey, description, certLang, certDoc, certFlag, certAcc, certTime, certIcon, metaTitle, metaDesc, faqs, reviews, contentOverrides, isActive } = req.body;

    if (!key || !name) {
      return res.status(400).json({ success: false, message: 'Key and name are required.' });
    }

    const existing = await prisma.service.findUnique({ where: { key } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Service key already exists.' });
    }

    // The URL slug defaults to the immutable key and can be changed later.
    const slugCheck = await validateSlug({ model: 'service', raw: req.body.slug || key });
    if (!slugCheck.ok) {
      return res.status(slugCheck.status).json({ success: false, message: slugCheck.message });
    }

    const service = await prisma.service.create({
      data: {
        key, name, icon, short: description || short, price, fast, label, tag, title, alt, p1, p2, ctaLabel, ctaKey, description,
        features: features || [],
        docs: docs || [],
        certLang, certDoc, certFlag, certAcc, certTime, certIcon, metaTitle, metaDesc, faqs, reviews,
        contentOverrides: contentOverrides || {},
        isActive: isActive !== undefined ? isActive : true,
        slug: slugCheck.slug
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
    const { name, icon, short, price, fast, label, tag, title, alt, p1, p2, features, docs, ctaLabel, ctaKey, description, certLang, certDoc, certFlag, certAcc, certTime, certIcon, metaTitle, metaDesc, faqs, reviews, contentOverrides, isActive } = req.body;

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
    // BUG-10: without this the isActive flag could never be turned off.
    if (isActive !== undefined) dataToUpdate.isActive = isActive;

    // A submitted slug is validated; an absent one leaves the current URL alone.
    if (req.body.slug !== undefined) {
      const slugCheck = await validateSlug({ model: 'service', raw: req.body.slug, id });
      if (!slugCheck.ok) {
        return res.status(slugCheck.status).json({ success: false, message: slugCheck.message });
      }
      dataToUpdate.slug = slugCheck.slug;
    }

    const service = await prisma.service.update({
      where: { id },
      data: dataToUpdate
    });

    if (price !== undefined && Number(price) > 0 && price !== existing.price) {
      try {
        const newP = Number(price);
        const newEcon = Math.round(newP * 0.7);
        const newExp = Math.round(newP * 1.5);

        const overrides = await prisma.serviceCityOverride.findMany({
          where: { serviceKey: existing.key }
        });

        for (const ov of overrides) {
          let updatedFaqs = ov.faqs;
          if (Array.isArray(updatedFaqs)) {
            updatedFaqs = updatedFaqs.map(f => {
              if (!f || typeof f !== 'object') return f;
              let a = f.a || f.answer || '';
              if (typeof a === 'string') {
                a = a.replace(/(starts from\s*₹)\d+(\/page\s*\(standard\),\s*₹)\d+(\/page\s*\(certified[^\)]*\),\s*and\s*₹)\d+(\/page\s*\(express[^\)]*\))/gi,
                  `$1${newEcon}$2${newP}$3${newExp}$4`
                );
                return { ...f, a: a, answer: a };
              }
              return f;
            });
          }

          let updatedCO = ov.contentOverrides || {};
          if (typeof updatedCO === 'object' && Array.isArray(updatedCO.pricingTiers)) {
            updatedCO.pricingTiers = updatedCO.pricingTiers.map((t, idx) => {
              if (idx === 0 || /standard/i.test(t.name)) return { ...t, price: `₹${newEcon}` };
              if (idx === 1 || /certified/i.test(t.name)) return { ...t, price: `₹${newP}` };
              if (idx === 2 || /express/i.test(t.name)) return { ...t, price: `₹${newExp}` };
              return t;
            });
          }

          await prisma.serviceCityOverride.update({
            where: { id: ov.id },
            data: {
              faqs: updatedFaqs,
              tier1Price: `₹${newEcon}`,
              tier2Price: `₹${newP}`,
              tier3Price: `₹${newExp}`,
              contentOverrides: updatedCO
            }
          });
        }
      } catch (syncErr) {
        console.warn('Service city override price sync warning:', syncErr);
      }
    }

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
    console.error('deleteService error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting service.' });
  }
};

module.exports = { getServices, getAllServices, createService, updateService, deleteService };
