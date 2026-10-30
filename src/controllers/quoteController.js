const prisma = require('../config/db');
const { isValidEmail, sendAdminLeadNotification, sendCustomerLeadConfirmation } = require('../utils/emailNotifier');

// Submit quote request (Public)
const submitQuote = async (req, res) => {
  try {
    const {
      name, email, phone, serviceKey, sourceLang, targetLang, pages, isInterpreter,
      notes, service, city, message, docType, addons, estimatedTotal, uploadedFiles, userNotes
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required.' });
    }

    // SEC-08: bound every free-text field.
    const cap = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : v);
    if (String(name).trim().length > 120 || String(phone).trim().length > 32) {
      return res.status(400).json({ success: false, message: 'Name or phone is too long.' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const numericMap = {
      '850': 'Certified Translation',
      '899': 'Website Localization',
      '999': 'Notarized Translation',
      '1400': 'Apostille & Attestation',
      '2500': 'Interpreter Service',
      '4500': 'Interpreter Service (Half-Day)',
      '7500': 'Interpreter Service (Full-Day)',
      'certified': 'Certified Translation',
      'legal': 'Legal Translation',
      'medical': 'Medical Translation',
      'technical': 'Technical Translation',
      'business': 'Business Translation',
      'academic': 'Academic Translation',
      'interpretation': 'Interpretation Service',
      'apostille': 'MEA Apostille',
      'attestation': 'Embassy Attestation',
      'localization': 'Website Localization'
    };
    let cleanKey = (serviceKey || service || 'Certified Translation').toString().trim();
    if (numericMap[cleanKey.toLowerCase()]) {
      cleanKey = numericMap[cleanKey.toLowerCase()];
    } else {
      cleanKey = cleanKey.split(' — ')[0].split(' - ')[0].trim();
    }
    const finalServiceKey = cleanKey;

    // Extract all structured fields from request body or notes string
    let effectiveCity = city;
    if (!effectiveCity && notes && typeof notes === 'string') {
      const match = notes.match(/City:\s*([^|\n,]+)/i);
      if (match && match[1] && match[1].trim() !== 'N/A') {
        effectiveCity = match[1].trim();
      }
    }

    let effectiveDocType = docType;
    if (!effectiveDocType && notes && typeof notes === 'string') {
      const match = notes.match(/DocType:\s*([^|\n]+)/i);
      if (match && match[1] && match[1].trim() !== 'N/A') {
        effectiveDocType = match[1].trim();
      }
    }

    let effectiveAddons = addons;
    if (!effectiveAddons && notes && typeof notes === 'string') {
      const match = notes.match(/Add-ons:\s*([^|\n]+)/i);
      if (match && match[1]) effectiveAddons = match[1].trim();
    }

    let effectiveTotal = estimatedTotal;
    if (!effectiveTotal && notes && typeof notes === 'string') {
      const match = notes.match(/Total:\s*([^|\n]+)/i);
      if (match && match[1]) effectiveTotal = match[1].trim();
    }

    let effectiveFiles = uploadedFiles;
    if (!effectiveFiles && notes && typeof notes === 'string') {
      const match = notes.match(/Files:\s*([^|\n]+)/i);
      if (match && match[1]) effectiveFiles = match[1].trim();
    }

    let cleanUserNotes = (userNotes || message || '').trim();
    if (!cleanUserNotes && notes && typeof notes === 'string') {
      if (notes.includes('DocType:')) {
        const parts = notes.split('|');
        if (parts.length >= 3) {
          cleanUserNotes = parts.slice(2).join('|').trim();
        }
      } else if (notes.includes('Message:')) {
        const match = notes.match(/Message:\s*([\s\S]+)/i);
        if (match && match[1]) cleanUserNotes = match[1].trim();
      } else if (!notes.startsWith('City:') && !notes.startsWith('Ref:')) {
        cleanUserNotes = notes.trim();
      }
    }

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const referenceId = `LG-${year}-${randomSuffix}`;

    // Structure complete notes containing reference, city, doc type, addons, and full user notes
    const leadNotesParts = [
      `Ref: ${referenceId}`,
      effectiveCity ? `City: ${effectiveCity}` : null,
      effectiveDocType ? `DocType: ${effectiveDocType}` : null,
      effectiveAddons && effectiveAddons !== 'None' ? `Add-ons: ${effectiveAddons}` : null,
      effectiveTotal ? `Total: ${effectiveTotal}` : null,
      effectiveFiles ? `Files: ${effectiveFiles}` : null,
      cleanUserNotes ? `User Notes: ${cleanUserNotes}` : (notes && !notes.includes('DocType:') ? notes : null)
    ].filter(Boolean).join(' | ');

    const quote = await prisma.quoteRequest.create({
      data: {
        name: cap(name, 120),
        email: email ? cap(email, 160) : null,
        phone: cap(phone, 32),
        serviceKey: cap(finalServiceKey, 60),
        sourceLang: cap(sourceLang, 60) || null,
        targetLang: cap(targetLang, 60) || null,
        pages: Math.min(Math.max(parseInt(pages) || 1, 1), 10000),
        isInterpreter: Boolean(isInterpreter),
        notes: cap(leadNotesParts, 4000)
      }
    });

    // Trigger admin email notification (fail-safe asynchronous execution)
    sendAdminLeadNotification({
      referenceId,
      name: quote.name,
      phone: quote.phone,
      email: quote.email,
      serviceKey: quote.serviceKey,
      sourceLang: quote.sourceLang,
      targetLang: quote.targetLang,
      pages: quote.pages,
      isInterpreter: quote.isInterpreter,
      city: effectiveCity,
      docType: effectiveDocType,
      addons: effectiveAddons,
      estimatedTotal: effectiveTotal,
      uploadedFiles: effectiveFiles,
      userNotes: cleanUserNotes,
      notes: quote.notes,
      message: cleanUserNotes
    }).catch(err => console.error('Admin notification error:', err));

    // Trigger customer confirmation email (fail-safe asynchronous execution)
    if (isValidEmail(quote.email)) {
      sendCustomerLeadConfirmation({
        toEmail: String(quote.email).trim(),
        name: quote.name,
        referenceId,
        serviceKey: quote.serviceKey,
        sourceLang: quote.sourceLang,
        targetLang: quote.targetLang,
        pages: quote.pages,
        isInterpreter: quote.isInterpreter,
        city: effectiveCity,
        docType: effectiveDocType,
        addons: effectiveAddons,
        estimatedTotal: effectiveTotal,
        uploadedFiles: effectiveFiles,
        userNotes: cleanUserNotes,
        notes: quote.notes
      }).catch(err => console.error('Customer confirmation error:', err));
    }

    return res.status(201).json({
      success: true,
      message: 'Quote request submitted successfully!',
      refId: referenceId,
      data: { ...quote, referenceId }
    });
  } catch (error) {
    console.error('Submit quote error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit quote request.' });
  }
};

// Get all quotes (Admin)
const getQuotes = async (req, res) => {
  try {
    const { status, all } = req.query;
    const where = status ? { status } : {};

    if (all === 'true') {
      const quotes = await prisma.quoteRequest.findMany({ where, orderBy: { createdAt: 'desc' } });
      return res.status(200).json({ success: true, data: quotes, total: quotes.length });
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200);

    const [quotes, total] = await Promise.all([
      prisma.quoteRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.quoteRequest.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: quotes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    });
  } catch (error) {
    console.error('getQuotes error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch quote requests.' });
  }
};

// Update quote status (Admin)
const updateQuoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['PENDING', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const updated = await prisma.quoteRequest.update({
      where: { id },
      data: { status }
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error && error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Quote request not found.' });
    }
    console.error('updateQuoteStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update quote status.' });
  }
};

// Delete a quote request (Admin)
const deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.quoteRequest.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Quote deleted successfully.' });
  } catch (error) {
    if (error && error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Quote request not found.' });
    }
    console.error('deleteQuote error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete quote.' });
  }
};

module.exports = { submitQuote, getQuotes, updateQuoteStatus, deleteQuote };
