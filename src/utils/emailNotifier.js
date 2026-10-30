const nodemailer = require('nodemailer');

/**
 * Creates and returns the Nodemailer transporter based on environment configuration.
 * Reads SMTP credentials dynamically from process.env so when production credentials
 * (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM) are updated in .env,
 * they take effect immediately without requiring code changes.
 */
function getTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const isSecure = smtpPort === 465 || process.env.SMTP_SECURE === 'true';

  if (!smtpHost || !smtpUser || !smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: isSecure,
    auth: {
      user: smtpUser,
      pass: String(smtpPass).replace(/\s+/g, '')
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Validates authentic email addresses (Gmail, Hostinger, Outlook, corporate domains, etc.)
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

function getSenderAddress() {
  const user = process.env.SMTP_USER || 'info@languageguruindia.com';
  return process.env.SMTP_FROM || `"Language Guru India" <${user}>`;
}

function getAdminEmail() {
  return process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'info@languageguruindia.com';
}

/**
 * Helper to format name and city consistently: e.g. "Arnab (Mumbai)"
 * If city is not provided, defaults cleanly to just the name.
 */
function formatNameCity(name, city) {
  const cleanName = (name || 'Valued Client').trim();
  const cleanCity = (city || '').trim();
  return cleanCity ? `${cleanName} (${cleanCity})` : cleanName;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONTACT INQUIRY EMAILS (Contact Form: /contact)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 1A. Admin Notification for Contact Form Inquiries
 * Distinct template focused on customer message, inquiry service/subject, and quick response
 */
async function sendAdminContactInquiryNotification({
  referenceId,
  name,
  phone,
  email,
  city,
  service,
  message
}) {
  const adminEmail = getAdminEmail();
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const nameWithCity = formatNameCity(name, city);

  console.log(`[CONTACT INQUIRY ADMIN NOTIFICATION] Processing inquiry [${referenceId}] for admin ${adminEmail} from ${nameWithCity}`);

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[CONTACT INQUIRY ADMIN NOTIFICATION - DEV LOG] SMTP not configured. Details:`);
    console.log(`  Reference ID: ${referenceId}`);
    console.log(`  From: ${nameWithCity} | Phone: ${phone} | Email: ${email || 'N/A'}`);
    console.log(`  Subject/Service: ${service || 'General Inquiry'}`);
    console.log(`  Message: ${message}`);
    return { success: true, simulated: true };
  }

  try {
    const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
    const mailOptions = {
      from: getSenderAddress(),
      to: adminEmail,
      subject: `📬 New Contact Inquiry: ${nameWithCity} [Ref: ${referenceId}]`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <!-- Top Banner -->
          <div style="background: #0f766e; color: #ffffff; padding: 22px 28px;">
            <div style="font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #a7f3d0; font-weight: 700; margin-bottom: 4px;">
              ⭐ New Contact Message &bull; Immediate Action Required
            </div>
            <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
              New Contact Inquiry: ${nameWithCity}
            </h2>
            <p style="margin: 6px 0 0; font-size: 13.5px; opacity: 0.95;">
              Inquiry Reference: <strong style="font-family: monospace; background: rgba(255,255,255,0.22); padding: 2px 8px; border-radius: 4px;">${referenceId}</strong>
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 26px 28px; background: #ffffff;">
            <!-- Customer Details Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; width: 35%; font-weight: 600;">Sender Name:</td>
                  <td style="padding: 10px 0; font-weight: 700; color: #0f172a; font-size: 15px;">${name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Location / City:</td>
                  <td style="padding: 10px 0; font-weight: 700; color: #0f766e;">📍 ${city || 'Not specified'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Phone / WhatsApp:</td>
                  <td style="padding: 10px 0; font-weight: 700; color: #0284c7;">
                    <a href="tel:${phone}" style="color: #0284c7; text-decoration: none;">${phone}</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Email Address:</td>
                  <td style="padding: 10px 0; color: #0f172a;">
                    ${email ? `<a href="mailto:${email}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${email}</a>` : '<span style="color:#94a3b8">Not provided</span>'}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Subject / Service:</td>
                  <td style="padding: 10px 0; font-weight: 700; color: #1e3a8a;">${service || 'General Inquiry'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #94a3b8; font-size: 12px;">Submitted At:</td>
                  <td style="padding: 10px 0; color: #94a3b8; font-size: 12px;">${timestamp}</td>
                </tr>
              </tbody>
            </table>

            <!-- Customer Message Callout Box (Prominently Visible) -->
            <div style="margin-top: 20px; padding: 18px 20px; background: #f0fdf4; border: 1.5px solid #86efac; border-left: 5px solid #16a34a; border-radius: 8px;">
              <div style="font-size: 12px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                💬 Full Customer Message:
              </div>
              <div style="font-size: 15px; color: #14532d; line-height: 1.6; white-space: pre-line; word-break: break-word; font-weight: 500;">
                ${message || 'No additional message text provided.'}
              </div>
            </div>

            <!-- WhatsApp Shortcut -->
            <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
              <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px;">
                Direct Client Action:
              </div>
              <a href="https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(name)}%2C%20thank%20you%20for%20contacting%20Language%20Guru%20India%20(Ref%3A%20${referenceId})." style="display: inline-block; background: #22c55e; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 14px;">
                💬 Reply to ${name} via WhatsApp
              </a>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 14px 28px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0;">
            Language Guru India &bull; Contact Inquiry Desk &bull; Standard SLA: 15–30 Minutes
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[CONTACT INQUIRY ADMIN NOTIFICATION] Sent successfully via SMTP to ${adminEmail}`);
    return { success: true };
  } catch (err) {
    console.error('[CONTACT INQUIRY ADMIN NOTIFICATION ERROR]', err && err.message ? err.message : err);
    return { success: false, error: err.message };
  }
}

/**
 * 1B. Customer Confirmation for Contact Form Inquiries
 * Dispatched to the person who submitted the contact form (Sender)
 */
async function sendCustomerContactInquiryConfirmation({
  toEmail,
  name,
  city,
  referenceId,
  service,
  message
}) {
  if (!isValidEmail(toEmail)) {
    return { success: false, reason: 'Invalid or missing customer email.' };
  }

  const customerEmail = toEmail.trim();
  const nameWithCity = formatNameCity(name, city);
  console.log(`[CONTACT INQUIRY CUSTOMER CONFIRMATION] Preparing confirmation for ${customerEmail} (${nameWithCity}) [Ref: ${referenceId}]`);

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[CONTACT INQUIRY CUSTOMER CONFIRMATION - DEV LOG] SMTP not configured. Confirmation details:`);
    console.log(`  To: ${customerEmail}`);
    console.log(`  Heading: Thank You, ${nameWithCity}!`);
    console.log(`  Reference ID: ${referenceId}`);
    return { success: true, simulated: true };
  }

  try {
    const mailOptions = {
      from: getSenderAddress(),
      to: customerEmail,
      subject: `✅ Contact Inquiry Received: ${nameWithCity} [Ref: ${referenceId}] — Language Guru India`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <!-- Header Banner -->
          <div style="background: #1a3a6b; color: #ffffff; padding: 26px 28px; text-align: center;">
            <div style="font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase; color: #fbbf24; font-weight: 700; margin-bottom: 6px;">
              ISO-9001:2015 &amp; ISO 17100:2015 Certified Agency
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">
              Language Guru India
            </h1>
            <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.95;">
              Customer Support &amp; Direct Assistance Desk
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 28px 28px 24px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 22px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 16px auto; border-collapse: collapse; text-align: center;">
                <tr>
                  <td align="center" valign="middle" style="width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; text-align: center; vertical-align: middle; line-height: 64px; font-size: 32px; color: #16a34a; font-weight: bold; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif;">
                    &#10004;
                  </td>
                </tr>
              </table>
              <h2 style="margin: 0; font-size: 22px; color: #166534; font-weight: 800;">
                Thank You, ${nameWithCity}!
              </h2>
              <p style="color: #475569; font-size: 14px; margin: 8px 0 0; line-height: 1.5;">
                We have successfully received your inquiry. Our support team has assigned a dedicated coordinator to respond within <strong>15–30 minutes</strong>.
              </p>
            </div>

            <!-- Reference ID Card -->
            <div style="background: #f8fafc; border: 1.5px dashed #93c5fd; border-radius: 10px; padding: 14px 18px; text-align: center; margin-bottom: 22px;">
              <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.6px; color: #64748b; display: block; margin-bottom: 4px;">
                Your Inquiry Reference ID
              </span>
              <strong style="font-family: monospace; font-size: 22px; font-weight: 800; color: #1a3a6b; letter-spacing: 1px;">
                ${referenceId}
              </strong>
              <div style="font-size: 11.5px; color: #64748b; margin-top: 4px;">
                Please quote this Reference ID if you message or call us for instant assistance.
              </div>
            </div>

            <!-- Summary Card -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 22px;">
              <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #1a3a6b; margin-bottom: 10px;">
                📋 Summary of Your Submission
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 7px 0; color: #64748b; width: 35%;">Your Name:</td>
                    <td style="padding: 7px 0; font-weight: 700; color: #0f172a;">${name}</td>
                  </tr>
                  ${city ? `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 7px 0; color: #64748b;">City / Location:</td>
                    <td style="padding: 7px 0; color: #0f172a; font-weight: 600;">${city}</td>
                  </tr>` : ''}
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 7px 0; color: #64748b;">Topic / Service:</td>
                    <td style="padding: 7px 0; font-weight: 600; color: #1a3a6b;">${service || 'General Inquiry'}</td>
                  </tr>
                  ${message ? `
                  <tr>
                    <td style="padding: 7px 0; color: #64748b; vertical-align: top;">Your Message:</td>
                    <td style="padding: 7px 0; color: #334155; line-height: 1.5; white-space: pre-line;">${message}</td>
                  </tr>` : ''}
                </tbody>
              </table>
            </div>

            <!-- Instant WhatsApp Connection Button -->
            <div style="text-align: center; margin-top: 10px;">
              <a href="https://wa.me/919312690490?text=Hi%20Language%20Guru%2C%20I%20have%20submitted%20a%20contact%20inquiry%20(Ref%3A%20${referenceId}).%20Please%20assist%20me." style="display: inline-block; background: #25D366; color: #ffffff; padding: 12px 26px; border-radius: 8px; font-weight: 700; font-size: 14.5px; text-decoration: none;">
                💬 Chat with Support on WhatsApp
              </a>
              <div style="font-size: 12px; color: #64748b; margin-top: 8px;">
                Direct Helpline: <a href="tel:+919312690490" style="color: #0284c7; font-weight: 700; text-decoration: none;">+91-9312690490</a> / <a href="tel:+919810693777" style="color: #0284c7; font-weight: 700; text-decoration: none;">+91-9810693777</a>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 16px 28px; font-size: 11.5px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; line-height: 1.5;">
            Language Guru India Pvt. Ltd. &bull; 617, West End Mall, Janakpuri, New Delhi &bull;
            <a href="https://www.languageguruindia.com" style="color: #0284c7; text-decoration: none;">www.languageguruindia.com</a>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[CONTACT INQUIRY CUSTOMER CONFIRMATION] Email sent successfully via SMTP to ${customerEmail}`);
    return { success: true };
  } catch (err) {
    console.error('[CONTACT INQUIRY CUSTOMER CONFIRMATION ERROR]', err && err.message ? err.message : err);
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. QUOTE REQUEST EMAILS (Quote Form, Homepage Quick Quote, Detail Page)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 2A. Admin Notification for Quote Requests
 * Shows EVERY detail: Name, Phone, Email, City, Service, DocType, Languages, Pages,
 * Addons, Estimated Total, Uploaded Files, and PROMINENT CUSTOMER NOTES & SPECIAL REQUIREMENTS.
 */
async function sendAdminLeadNotification({
  referenceId,
  name,
  phone,
  email,
  serviceKey,
  sourceLang,
  targetLang,
  pages,
  isInterpreter,
  notes,
  city,
  message,
  docType,
  addons,
  estimatedTotal,
  uploadedFiles,
  userNotes
}) {
  const adminEmail = getAdminEmail();
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const nameWithCity = formatNameCity(name, city);

  // Extract clean customer notes / message text so admin can read every word
  let displayNotes = (userNotes || message || '').trim();
  if (!displayNotes && notes && typeof notes === 'string') {
    if (notes.includes('DocType:')) {
      const parts = notes.split('|');
      if (parts.length >= 3) {
        displayNotes = parts.slice(2).join('|').trim();
      }
    } else if (notes.includes('Message:')) {
      const match = notes.match(/Message:\s*([\s\S]+)/i);
      if (match && match[1]) displayNotes = match[1].trim();
    } else if (notes.includes('User Notes:')) {
      const match = notes.match(/User Notes:\s*([^|]+)/i);
      if (match && match[1]) displayNotes = match[1].trim();
    } else if (!notes.startsWith('City:') && !notes.startsWith('Ref:')) {
      displayNotes = notes.trim();
    } else {
      displayNotes = notes.trim();
    }
  }

  // Extract docType if not explicitly passed
  let displayDocType = docType;
  if (!displayDocType && notes && typeof notes === 'string') {
    const match = notes.match(/DocType:\s*([^|\n]+)/i);
    if (match && match[1] && match[1].trim() !== 'N/A') {
      displayDocType = match[1].trim();
    }
  }

  // Extract addons if in notes
  let displayAddons = addons;
  if (!displayAddons && notes && typeof notes === 'string') {
    const match = notes.match(/Add-ons:\s*([^|\n]+)/i);
    if (match && match[1]) displayAddons = match[1].trim();
  }

  // Extract estimatedTotal if in notes
  let displayTotal = estimatedTotal;
  if (!displayTotal && notes && typeof notes === 'string') {
    const match = notes.match(/Total:\s*([^|\n]+)/i);
    if (match && match[1]) displayTotal = match[1].trim();
  }

  // Extract uploadedFiles if in notes
  let displayFiles = uploadedFiles;
  if (!displayFiles && notes && typeof notes === 'string') {
    const match = notes.match(/Files:\s*([^|\n]+)/i);
    if (match && match[1]) displayFiles = match[1].trim();
  }

  console.log(`[ADMIN EMAIL NOTIFICATION] Processing quote lead [${referenceId}] for admin ${adminEmail} from ${nameWithCity}`);

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[ADMIN EMAIL NOTIFICATION - DEV LOG] SMTP not configured. Lead details:`);
    console.log(`  Reference ID: ${referenceId}`);
    console.log(`  Customer: ${nameWithCity} | Phone: ${phone} | Email: ${email || 'N/A'}`);
    console.log(`  Service: ${serviceKey} | DocType: ${displayDocType || 'N/A'}`);
    console.log(`  Languages: ${sourceLang || 'English'} -> ${targetLang || 'Hindi'}`);
    console.log(`  Pages: ${pages} | Add-ons: ${displayAddons || 'None'} | Total: ${displayTotal || 'N/A'}`);
    console.log(`  Notes: ${displayNotes || 'None'}`);
    return { success: true, simulated: true };
  }

  try {
    const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
    const mailOptions = {
      from: getSenderAddress(),
      to: adminEmail,
      subject: `🔔 New Quote Request: ${nameWithCity} - ${serviceKey || 'Certified Translation'} [Ref: ${referenceId}]`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <!-- Top Banner -->
          <div style="background: #1a3a6b; color: #ffffff; padding: 22px 28px;">
            <div style="font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #fbbf24; font-weight: 700; margin-bottom: 4px;">
              ⭐ New Lead Received &bull; Immediate Action Required
            </div>
            <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
              New Quote Request: ${nameWithCity}
            </h2>
            <p style="margin: 6px 0 0; font-size: 13.5px; opacity: 0.95;">
              Submission Reference: <strong style="font-family: monospace; background: rgba(255,255,255,0.18); padding: 2px 8px; border-radius: 4px;">${referenceId}</strong>
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 26px 28px; background: #ffffff;">
            <!-- Customer Details Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; width: 35%; font-weight: 600;">Customer Name:</td>
                  <td style="padding: 10px 0; font-weight: 700; color: #0f172a; font-size: 15px;">${name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Target City:</td>
                  <td style="padding: 10px 0; font-weight: 700; color: #0284c7;">📍 ${city || 'Not specified'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Phone / WhatsApp:</td>
                  <td style="padding: 10px 0; font-weight: 700; color: #0284c7;">
                    <a href="tel:${phone}" style="color: #0284c7; text-decoration: none;">${phone}</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Email Address:</td>
                  <td style="padding: 10px 0; color: #0f172a;">
                    ${email ? `<a href="mailto:${email}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${email}</a>` : '<span style="color:#94a3b8">Not provided</span>'}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Service Requested:</td>
                  <td style="padding: 10px 0; font-weight: 700; color: #1a3a6b;">${serviceKey || 'Certified Translation'}</td>
                </tr>
                ${displayDocType ? `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Document Type:</td>
                  <td style="padding: 10px 0; font-weight: 600; color: #0f172a;">${displayDocType}</td>
                </tr>` : ''}
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Language Pair:</td>
                  <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">
                    ${sourceLang || 'English'} &rarr; ${targetLang || 'Hindi / Required'}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Volume / Pages:</td>
                  <td style="padding: 10px 0; font-weight: 600; color: #0f172a;">
                    ${pages || 1} ${isInterpreter ? 'Day(s)' : 'Page(s)'}
                  </td>
                </tr>
                ${displayAddons && displayAddons !== 'None' ? `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Selected Add-ons:</td>
                  <td style="padding: 10px 0; font-weight: 600; color: #92400e;">
                    <span style="background: #fef3c7; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 4px;">${displayAddons}</span>
                  </td>
                </tr>` : ''}
                ${displayTotal ? `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Estimated Total:</td>
                  <td style="padding: 10px 0; font-weight: 800; color: #166534; font-size: 15px;">${displayTotal}</td>
                </tr>` : ''}
                ${displayFiles ? `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Uploaded Files:</td>
                  <td style="padding: 10px 0; font-weight: 600; color: #1e40af;">📎 ${displayFiles}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 10px 0; color: #94a3b8; font-size: 12px;">Submitted At:</td>
                  <td style="padding: 10px 0; color: #94a3b8; font-size: 12px;">${timestamp}</td>
                </tr>
              </tbody>
            </table>

            <!-- PROMINENT USER NOTES & SPECIAL REQUIREMENTS CALLOUT BOX -->
            <div style="margin-top: 20px; padding: 18px 20px; background: #fefce8; border: 1.5px solid #fde047; border-left: 5px solid #ca8a04; border-radius: 8px;">
              <div style="font-size: 12px; font-weight: 800; color: #854d0e; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                📝 Customer Notes &amp; Special Requirements:
              </div>
              <div style="font-size: 15px; color: #713f12; line-height: 1.6; white-space: pre-line; word-break: break-word; font-weight: 500;">
                ${displayNotes && displayNotes !== 'No additional message.' ? displayNotes : '<span style="color: #a16207; font-style: italic;">No special requirements or notes specified by customer.</span>'}
              </div>
            </div>

            <!-- WhatsApp Shortcut Button -->
            <div style="margin-top: 24px; padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; text-align: center;">
              <div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 10px;">
                Direct Client Action Shortcut:
              </div>
              <a href="https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(name)}%2C%20thank%20you%20for%20contacting%20Language%20Guru%20India%20regarding%20your%20translation%20request%20(Ref%3A%20${referenceId})." style="display: inline-block; background: #22c55e; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 14px;">
                💬 Reply to Client via WhatsApp
              </a>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 14px 28px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0;">
            Language Guru India Automated Lead Dispatch &bull; Standard SLA: 15–30 Minutes
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[ADMIN EMAIL NOTIFICATION] Lead email sent successfully via SMTP to ${adminEmail}`);
    return { success: true };
  } catch (err) {
    console.error('[ADMIN EMAIL NOTIFICATION ERROR]', err && err.message ? err.message : err);
    return { success: false, error: err.message };
  }
}

/**
 * 2B. Customer Confirmation for Quote Requests
 * Dispatched to the Customer's Email Address (Sender)
 */
async function sendCustomerLeadConfirmation({
  toEmail,
  name,
  referenceId,
  serviceKey,
  sourceLang,
  targetLang,
  pages,
  isInterpreter,
  city,
  docType,
  addons,
  estimatedTotal,
  uploadedFiles,
  userNotes,
  notes
}) {
  if (!isValidEmail(toEmail)) {
    return { success: false, reason: 'Invalid or missing customer email.' };
  }

  const customerEmail = toEmail.trim();
  const nameWithCity = formatNameCity(name, city);

  // Extract clean customer notes
  let displayNotes = (userNotes || '').trim();
  if (!displayNotes && notes && typeof notes === 'string') {
    if (notes.includes('DocType:')) {
      const parts = notes.split('|');
      if (parts.length >= 3) {
        displayNotes = parts.slice(2).join('|').trim();
      }
    } else if (notes.includes('Message:')) {
      const match = notes.match(/Message:\s*([\s\S]+)/i);
      if (match && match[1]) displayNotes = match[1].trim();
    } else if (!notes.startsWith('City:') && !notes.startsWith('Ref:')) {
      displayNotes = notes.trim();
    }
  }

  let displayDocType = docType;
  if (!displayDocType && notes && typeof notes === 'string') {
    const match = notes.match(/DocType:\s*([^|\n]+)/i);
    if (match && match[1] && match[1].trim() !== 'N/A') {
      displayDocType = match[1].trim();
    }
  }

  console.log(`[CUSTOMER CONFIRMATION EMAIL] Preparing confirmation for ${customerEmail} (${nameWithCity}) [Ref: ${referenceId}]`);

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[CUSTOMER CONFIRMATION EMAIL - DEV LOG] SMTP not configured. Details:`);
    console.log(`  To: ${customerEmail}`);
    console.log(`  Heading: Thank You, ${nameWithCity}!`);
    console.log(`  Reference ID: ${referenceId}`);
    return { success: true, simulated: true };
  }

  try {
    const mailOptions = {
      from: getSenderAddress(),
      to: customerEmail,
      subject: `📋 Quote Request Received: ${nameWithCity} [Ref: ${referenceId}] — Language Guru India`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <!-- Header Banner -->
          <div style="background: #1a3a6b; color: #ffffff; padding: 26px 28px; text-align: center;">
            <div style="font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase; color: #fbbf24; font-weight: 700; margin-bottom: 6px;">
              ISO-9001:2015 &amp; ISO 17100:2015 Certified Agency
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">
              Language Guru India
            </h1>
            <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.95;">
              India's #1 Certified Translation &amp; Legalization Service
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 28px 28px 24px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 22px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 16px auto; border-collapse: collapse; text-align: center;">
                <tr>
                  <td align="center" valign="middle" style="width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; text-align: center; vertical-align: middle; line-height: 64px; font-size: 32px; color: #16a34a; font-weight: bold; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif;">
                    &#10004;
                  </td>
                </tr>
              </table>
              <h2 style="margin: 0; font-size: 22px; color: #166534; font-weight: 800;">
                Thank You, ${nameWithCity}!
              </h2>
              <p style="color: #475569; font-size: 14px; margin: 8px 0 0; line-height: 1.5;">
                We have successfully received your quote request. Our translation coordinators are reviewing your document scope right now.
              </p>
            </div>

            <!-- Reference ID Card -->
            <div style="background: #f8fafc; border: 1.5px dashed #93c5fd; border-radius: 10px; padding: 14px 18px; text-align: center; margin-bottom: 22px;">
              <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.6px; color: #64748b; display: block; margin-bottom: 4px;">
                Your Official Quote Reference ID
              </span>
              <strong style="font-family: monospace; font-size: 22px; font-weight: 800; color: #1a3a6b; letter-spacing: 1px;">
                ${referenceId}
              </strong>
              <div style="font-size: 11.5px; color: #64748b; margin-top: 4px;">
                Please quote this Reference ID in any communication or WhatsApp chats.
              </div>
            </div>

            <!-- Submission Details Summary -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 22px;">
              <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #1a3a6b; margin-bottom: 10px;">
                📋 Summary of Your Request
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 7px 0; color: #64748b; width: 38%;">Service:</td>
                    <td style="padding: 7px 0; font-weight: 700; color: #0f172a;">${serviceKey || 'Certified Translation'}</td>
                  </tr>
                  ${displayDocType ? `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 7px 0; color: #64748b;">Document Type:</td>
                    <td style="padding: 7px 0; font-weight: 600; color: #0f172a;">${displayDocType}</td>
                  </tr>` : ''}
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 7px 0; color: #64748b;">Languages:</td>
                    <td style="padding: 7px 0; font-weight: 600; color: #0f172a;">
                      ${sourceLang || 'English'} &rarr; ${targetLang || 'Hindi / Required'}
                    </td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 7px 0; color: #64748b;">Quantity / Scope:</td>
                    <td style="padding: 7px 0; font-weight: 600; color: #0f172a;">
                      ${pages || 1} ${isInterpreter ? 'Day(s)' : 'Page(s)'}
                    </td>
                  </tr>
                  ${city ? `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 7px 0; color: #64748b;">Target City:</td>
                    <td style="padding: 7px 0; color: #0f172a; font-weight: 600;">${city}</td>
                  </tr>` : ''}
                </tbody>
              </table>

              ${displayNotes ? `
              <div style="margin-top: 14px; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">
                  Your Notes / Instructions:
                </div>
                <div style="font-size: 13.5px; color: #334155; line-height: 1.5; white-space: pre-line;">
                  ${displayNotes}
                </div>
              </div>` : ''}
            </div>

            <!-- What Happens Next -->
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; margin-bottom: 22px;">
              <div style="font-size: 13.5px; font-weight: 800; color: #1e40af; margin-bottom: 6px;">
                ⏱️ What Happens Next?
              </div>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #1e3a8a; line-height: 1.6;">
                <li>Our dedicated language specialist will review your document scope within <strong>15–30 minutes</strong>.</li>
                <li>We will provide an official stamp-ready quotation with turnaround commitment and delivery timeline.</li>
                <li>Certified translations include our signed declaration, ISO stamps, and embassy acceptance guarantee.</li>
              </ul>
            </div>

            <!-- Instant WhatsApp Connection Button -->
            <div style="text-align: center; margin-top: 10px;">
              <a href="https://wa.me/919312690490?text=Hi%20Language%20Guru%2C%20I%20have%20submitted%20a%20quote%20request%20with%20Ref%3A%20${referenceId}.%20Please%20assist%20me." style="display: inline-block; background: #25D366; color: #ffffff; padding: 12px 26px; border-radius: 8px; font-weight: 700; font-size: 14.5px; text-decoration: none;">
                💬 Chat with Translation Coordinator on WhatsApp
              </a>
              <div style="font-size: 12px; color: #64748b; margin-top: 8px;">
                Direct Call: <a href="tel:+919312690490" style="color: #0284c7; font-weight: 700; text-decoration: none;">+91-9312690490</a> / <a href="tel:+919810693777" style="color: #0284c7; font-weight: 700; text-decoration: none;">+91-9810693777</a>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 16px 28px; font-size: 11.5px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; line-height: 1.5;">
            Language Guru India Pvt. Ltd. &bull; 617, West End Mall, Janakpuri, New Delhi &bull;
            <a href="https://www.languageguruindia.com" style="color: #0284c7; text-decoration: none;">www.languageguruindia.com</a>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[CUSTOMER CONFIRMATION EMAIL] Confirmation email sent successfully via SMTP to ${customerEmail}`);
    return { success: true };
  } catch (err) {
    console.error('[CUSTOMER CONFIRMATION EMAIL ERROR]', err && err.message ? err.message : err);
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. LINGUIST APPLICATION EMAILS (Join Form: /join)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 3. Linguist Applications: Dual delivery for Career / Join applications
 * Shows candidate profile and PROMINENT COVER NOTE & INTRODUCTION TEXT.
 */
async function sendLinguistApplicationNotifications({
  referenceId,
  name,
  email,
  phone,
  city,
  srcLang,
  tgtLang,
  expertise,
  experience,
  intro,
  resumeUrl,
  originalFileName
}) {
  const adminEmail = getAdminEmail();
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const nameWithCity = formatNameCity(name, city);

  console.log(`[LINGUIST APPLICATION] Processing application [${referenceId}] from ${nameWithCity}`);

  const transporter = getTransporter();
  const siteUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const fullResumeUrl = resumeUrl ? (resumeUrl.startsWith('http') ? resumeUrl : `${siteUrl}${resumeUrl}`) : null;

  if (!transporter) {
    console.log(`[LINGUIST APPLICATION - DEV LOG] SMTP not configured. Applicant summary:`);
    console.log(`  Ref: ${referenceId} | Candidate: ${nameWithCity} (${phone}) | Email: ${email || 'N/A'}`);
    console.log(`  Languages: ${srcLang} -> ${tgtLang} | Expertise: ${expertise} | Exp: ${experience}`);
    console.log(`  Resume: ${resumeUrl || 'None'}`);
    console.log(`  Cover Note: ${intro || 'None'}`);
    return { success: true, simulated: true };
  }

  // 1. Dispatch Email to Admin
  try {
    const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
    const adminMail = {
      from: getSenderAddress(),
      to: adminEmail,
      subject: `💼 New Translator Application: ${nameWithCity} [Ref: ${referenceId}]`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <!-- Header Banner -->
          <div style="background: #1e3a8a; color: #ffffff; padding: 22px 28px;">
            <div style="font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #67e8f9; font-weight: 700; margin-bottom: 4px;">
              🌐 Careers &bull; New Translator Application
            </div>
            <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
              New Translator Application: ${nameWithCity}
            </h2>
            <p style="margin: 6px 0 0; font-size: 13.5px; opacity: 0.95;">
              Application Reference: <strong style="font-family: monospace; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 4px;">${referenceId}</strong>
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 26px 28px; background: #ffffff;">
            <!-- Candidate Details Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b; width: 35%; font-weight: 600;">Candidate Name:</td>
                  <td style="padding: 9px 0; font-weight: 700; color: #0f172a; font-size: 15px;">${name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: 600;">Location / City:</td>
                  <td style="padding: 9px 0; font-weight: 700; color: #0f766e;">📍 ${city || 'Not specified'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: 600;">Phone / WhatsApp:</td>
                  <td style="padding: 9px 0; font-weight: 700; color: #0284c7;">
                    <a href="tel:${phone}" style="color: #0284c7; text-decoration: none;">${phone}</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: 600;">Email Address:</td>
                  <td style="padding: 9px 0; color: #0f172a;">
                    ${email ? `<a href="mailto:${email}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${email}</a>` : 'N/A'}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: 600;">Language Pair:</td>
                  <td style="padding: 9px 0; font-weight: 700; color: #1e3a8a;">
                    ${srcLang || 'N/A'} &rarr; ${tgtLang || 'N/A'}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: 600;">Specialization:</td>
                  <td style="padding: 9px 0; color: #0f172a; font-weight: 600;">${expertise || 'General'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: 600;">Experience:</td>
                  <td style="padding: 9px 0; color: #0f172a; font-weight: 600;">${experience || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: 600;">Attached CV / Resume:</td>
                  <td style="padding: 9px 0;">
                    ${fullResumeUrl ? `<a href="${fullResumeUrl}" target="_blank" style="display: inline-block; background: #e0f2fe; color: #0284c7; padding: 6px 12px; border-radius: 6px; font-weight: 700; font-size: 12.5px; text-decoration: none;">📄 View / Download CV (${originalFileName || 'Resume'})</a>` : '<span style="color:#94a3b8">No resume attached</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 9px 0; color: #94a3b8; font-size: 12px;">Submitted At:</td>
                  <td style="padding: 9px 0; color: #94a3b8; font-size: 12px;">${timestamp}</td>
                </tr>
              </tbody>
            </table>

            <!-- PROMINENT CANDIDATE INTRODUCTION / COVER NOTE CALLOUT BOX -->
            <div style="margin-top: 20px; padding: 18px 20px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-left: 5px solid #2563eb; border-radius: 8px;">
              <div style="font-size: 12px; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                💬 Candidate Introduction &amp; Cover Note:
              </div>
              <div style="font-size: 15px; color: #1e3a8a; line-height: 1.6; white-space: pre-line; word-break: break-word; font-weight: 500;">
                ${intro || '<span style="color: #60a5fa; font-style: italic;">No cover note provided by candidate.</span>'}
              </div>
            </div>

            <!-- WhatsApp Shortcut Button -->
            <div style="margin-top: 20px; text-align: center;">
              <a href="https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(name)}%2C%20thank%20you%20for%20applying%20to%20Language%20Guru%20(Ref%3A%20${referenceId})." style="display: inline-block; background: #22c55e; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none;">
                💬 Contact Candidate on WhatsApp
              </a>
            </div>
          </div>
        </div>
      `
    };
    await transporter.sendMail(adminMail);
    console.log(`[LINGUIST APPLICATION] Admin notification email sent to ${adminEmail}`);
  } catch (adminErr) {
    console.error('[LINGUIST APPLICATION ADMIN NOTIFICATION ERROR]', adminErr);
  }

  // 2. Dispatch Confirmation to Applicant (if authentic email provided)
  if (isValidEmail(email)) {
    try {
      const applicantMail = {
        from: getSenderAddress(),
        to: email.trim(),
        subject: `🎉 Application Received: Welcome ${nameWithCity} [Ref: ${referenceId}] — Language Guru Linguist Panel`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
            <div style="background: #1a3a6b; color: #ffffff; padding: 24px 28px; text-align: center;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
                Language Guru India
              </h1>
              <p style="margin: 4px 0 0; font-size: 13.5px; opacity: 0.9;">
                Linguist &amp; Interpreter Network Application
              </p>
            </div>
            <div style="padding: 26px 28px; background: #ffffff;">
              <h2 style="margin: 0 0 10px; font-size: 20px; color: #166534; font-weight: 800;">
                Welcome, ${nameWithCity}!
              </h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0 0 16px;">
                Your application to join the certified translator and interpreter panel at Language Guru India has been successfully registered.
              </p>
              <div style="background: #f8fafc; border: 1.5px dashed #93c5fd; border-radius: 8px; padding: 12px; text-align: center; margin-bottom: 18px;">
                <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block;">Application Reference Number</span>
                <strong style="font-family: monospace; font-size: 20px; color: #1a3a6b;">${referenceId}</strong>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 18px; font-size: 13.5px;">
                <div style="font-weight: bold; color: #1e3a8a; margin-bottom: 6px;">Profile Snapshot:</div>
                <div style="color: #334155;"><strong>Languages:</strong> ${srcLang} &rarr; ${tgtLang}</div>
                <div style="color: #334155; margin-top: 4px;"><strong>Specialization:</strong> ${expertise}</div>
                ${city ? `<div style="color: #334155; margin-top: 4px;"><strong>Base City:</strong> ${city}</div>` : ''}
              </div>

              ${intro ? `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 18px;">
                <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 4px;">
                  Copy of Your Cover Note / Introduction:
                </span>
                <div style="font-size: 13.5px; color: #334155; line-height: 1.5; white-space: pre-line;">
                  ${intro}
                </div>
              </div>` : ''}

              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; font-size: 13px; color: #1e3a8a; line-height: 1.5;">
                <strong>Next Steps:</strong> Our vendor management team will review your profile, language pair, and sample qualifications within <strong>1–2 business days</strong>. Shortlisted candidates will be invited for onboarding and rate agreement.
              </div>
            </div>
            <div style="background: #f8fafc; padding: 12px 28px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0;">
              Language Guru India &bull; Vendor Management Team &bull; info@languageguruindia.com
            </div>
          </div>
        `
      };
      await transporter.sendMail(applicantMail);
      console.log(`[LINGUIST APPLICATION] Applicant confirmation sent to ${email}`);
    } catch (appErr) {
      console.error('[LINGUIST APPLICATION APPLICANT NOTIFICATION ERROR]', appErr);
    }
  }

  return { success: true };
}

module.exports = {
  isValidEmail,
  formatNameCity,
  sendAdminContactInquiryNotification,
  sendCustomerContactInquiryConfirmation,
  sendAdminLeadNotification,
  sendCustomerLeadConfirmation,
  sendLinguistApplicationNotifications
};
