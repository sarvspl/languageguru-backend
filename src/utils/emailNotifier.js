const nodemailer = require('nodemailer');

/**
 * Creates and returns the Nodemailer transporter based on environment configuration.
 * Supports standard Gmail SMTP, Google Workspace, and custom SMTP servers.
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
 * Validates any authentic email address (Gmail, Hostinger, Outlook, corporate domains, etc.)
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
 * 1. ADMIN NOTIFICATION: Dispatched to the Language Guru Team Gmail
 * Triggered on: Quote Request, Contact Form, Homepage Quick Lead
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
  message
}) {
  const adminEmail = getAdminEmail();
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  console.log(`[ADMIN EMAIL NOTIFICATION] Processing lead [${referenceId}] for admin ${adminEmail}`);

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[ADMIN EMAIL NOTIFICATION - DEV LOG] SMTP not configured. Lead details:`);
    console.log(`  Reference ID: ${referenceId}`);
    console.log(`  Customer: ${name} | Phone: ${phone} | Email: ${email || 'N/A'}`);
    console.log(`  Service: ${serviceKey} | ${sourceLang || 'English'} -> ${targetLang || 'Hindi'}`);
    console.log(`  Pages: ${pages} | City: ${city || 'N/A'}`);
    return { success: true, simulated: true };
  }

  try {
    const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
    const mailOptions = {
      from: getSenderAddress(),
      to: adminEmail,
      subject: `🔔 New Quote Lead [${referenceId}]: ${serviceKey || 'Certified Translation'} from ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: #1a3a6b; color: #ffffff; padding: 22px 28px;">
            <div style="font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #fbbf24; font-weight: 700; margin-bottom: 4px;">
              ⭐ New Lead Received &bull; Immediate Action Required
            </div>
            <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
              Language Guru Lead Alert
            </h2>
            <p style="margin: 6px 0 0; font-size: 13.5px; opacity: 0.95;">
              Submission Reference: <strong style="font-family: monospace; background: rgba(255,255,255,0.18); padding: 2px 8px; border-radius: 4px;">${referenceId}</strong>
            </p>
          </div>

          <div style="padding: 26px 28px; background: #ffffff;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; width: 35%; font-weight: 600;">Customer Name:</td>
                  <td style="padding: 10px 0; font-weight: 700; color: #0f172a; font-size: 15px;">${name}</td>
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
                ${city ? `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Target City:</td>
                  <td style="padding: 10px 0; font-weight: 600; color: #0f172a;">${city}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600; vertical-align: top;">Notes / Message:</td>
                  <td style="padding: 10px 0; color: #334155; white-space: pre-line; line-height: 1.5;">${notes || message || 'No additional message.'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #94a3b8; font-size: 12px;">Submitted At:</td>
                  <td style="padding: 10px 0; color: #94a3b8; font-size: 12px;">${timestamp}</td>
                </tr>
              </tbody>
            </table>

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
 * 2. CUSTOMER CONFIRMATION: Dispatched to the Customer's Email Address (Sender)
 * Triggered on: Quote Request, Contact Form, Homepage Lead (whenever email is provided)
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
  notes
}) {
  if (!isValidEmail(toEmail)) {
    return { success: false, reason: 'Invalid or missing customer email.' };
  }

  const customerEmail = toEmail.trim();
  console.log(`[CUSTOMER CONFIRMATION EMAIL] Preparing confirmation for ${customerEmail} (Ref: ${referenceId})`);

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[CUSTOMER CONFIRMATION EMAIL - DEV LOG] SMTP not configured. Confirmation details:`);
    console.log(`  To: ${customerEmail}`);
    console.log(`  Reference ID: ${referenceId}`);
    console.log(`  Message: Thank you ${name}, your request has been confirmed.`);
    return { success: true, simulated: true };
  }

  try {
    const mailOptions = {
      from: getSenderAddress(),
      to: customerEmail,
      subject: `✅ Request Confirmed [${referenceId}] — Language Guru India`,
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
                  <td align="center" valign="middle" style="width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; text-align: center; vertical-align: middle; line-height: 64px; font-size: 32px; color: #16a34a; font-weight: bold; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; mso-line-height-rule: exactly;">
                    &#10004;
                  </td>
                </tr>
              </table>
              <h2 style="margin: 0; font-size: 20px; color: #166534; font-weight: 800;">
                Thank You, ${name}!
              </h2>
              <p style="color: #475569; font-size: 14px; margin: 6px 0 0; line-height: 1.5;">
                We have successfully received your translation inquiry. Our project coordinators are reviewing your submission right now.
              </p>
            </div>

            <!-- Reference ID Card -->
            <div style="background: #f8fafc; border: 1.5px dashed #93c5fd; border-radius: 10px; padding: 14px 18px; text-align: center; margin-bottom: 22px;">
              <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.6px; color: #64748b; display: block; margin-bottom: 4px;">
                Your Official Submission Reference ID
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
                    <td style="padding: 7px 0; color: #64748b;">City:</td>
                    <td style="padding: 7px 0; color: #0f172a;">${city}</td>
                  </tr>` : ''}
                </tbody>
              </table>
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

/**
 * 3. LINGUIST APPLICATION NOTIFICATIONS: Dual delivery for Career / Join applications
 * Triggered on: POST /api/v1/translators/apply
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

  console.log(`[LINGUIST APPLICATION] Processing application [${referenceId}] from ${name}`);

  const transporter = getTransporter();
  const siteUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const fullResumeUrl = resumeUrl ? (resumeUrl.startsWith('http') ? resumeUrl : `${siteUrl}${resumeUrl}`) : null;

  if (!transporter) {
    console.log(`[LINGUIST APPLICATION - DEV LOG] SMTP not configured. Applicant summary:`);
    console.log(`  Ref: ${referenceId} | Candidate: ${name} (${phone}) | Email: ${email || 'N/A'}`);
    console.log(`  Languages: ${srcLang} -> ${tgtLang} | Expertise: ${expertise} | Exp: ${experience}`);
    console.log(`  Resume: ${resumeUrl || 'None'}`);
    return { success: true, simulated: true };
  }

  // 1. Dispatch Email to Admin
  try {
    const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
    const adminMail = {
      from: getSenderAddress(),
      to: adminEmail,
      subject: `💼 New Linguist Application [${referenceId}]: ${name} (${srcLang || 'Source'} → ${tgtLang || 'Target'})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: #1e3a8a; color: #ffffff; padding: 22px 28px;">
            <div style="font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #67e8f9; font-weight: 700; margin-bottom: 4px;">
              🌐 Careers &bull; New Translator Application
            </div>
            <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
              Linguist Profile Submitted
            </h2>
            <p style="margin: 6px 0 0; font-size: 13.5px; opacity: 0.95;">
              Application Reference: <strong style="font-family: monospace;">${referenceId}</strong>
            </p>
          </div>

          <div style="padding: 26px 28px; background: #ffffff;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b; width: 35%; font-weight: 600;">Candidate Name:</td>
                  <td style="padding: 9px 0; font-weight: 700; color: #0f172a;">${name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: 600;">Phone / WhatsApp:</td>
                  <td style="padding: 9px 0; font-weight: 700; color: #0284c7;">
                    <a href="tel:${phone}" style="color: #0284c7; text-decoration: none;">${phone}</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: 600;">Email:</td>
                  <td style="padding: 9px 0; color: #0f172a;">${email || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: 600;">Location / City:</td>
                  <td style="padding: 9px 0; color: #0f172a;">${city || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: 600;">Language Pair:</td>
                  <td style="padding: 9px 0; font-weight: 700; color: #1e3a8a;">
                    ${srcLang || 'N/A'} &rarr; ${tgtLang || 'N/A'}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: 600;">Specialization:</td>
                  <td style="padding: 9px 0; color: #0f172a;">${expertise || 'General'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: 600;">Experience:</td>
                  <td style="padding: 9px 0; color: #0f172a;">${experience || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: 600;">Attached CV:</td>
                  <td style="padding: 9px 0;">
                    ${fullResumeUrl ? `<a href="${fullResumeUrl}" target="_blank" style="display: inline-block; background: #e0f2fe; color: #0284c7; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; text-decoration: none;">📄 View / Download CV (${originalFileName || 'Resume'})</a>` : '<span style="color:#94a3b8">No resume attached</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 9px 0; color: #64748b; font-weight: 600; vertical-align: top;">Cover Note:</td>
                  <td style="padding: 9px 0; color: #334155; line-height: 1.5; white-space: pre-line;">${intro || 'None'}</td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 20px; text-align: center;">
              <a href="https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(name)}%2C%20thank%20you%20for%20applying%20to%20Language%20Guru%20(Ref%3A%20${referenceId})." style="display: inline-block; background: #22c55e; color: #ffffff; padding: 10px 22px; border-radius: 8px; font-weight: 700; font-size: 13.5px; text-decoration: none;">
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
        subject: `Application Received [Ref: ${referenceId}] — Language Guru Linguist Network`,
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
              <h2 style="margin: 0 0 10px; font-size: 18px; color: #166534;">
                Thank you for applying, ${name}!
              </h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0 0 16px;">
                Your application to join the certified translator and interpreter panel at Language Guru India has been successfully registered.
              </p>
              <div style="background: #f8fafc; border: 1.5px dashed #93c5fd; border-radius: 8px; padding: 12px; text-align: center; margin-bottom: 18px;">
                <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block;">Application Reference Number</span>
                <strong style="font-family: monospace; font-size: 20px; color: #1a3a6b;">${referenceId}</strong>
              </div>
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; font-size: 13px; color: #1e3a8a; line-height: 1.5;">
                <strong>Next Steps:</strong> Our vendor management team will review your profile, language pair (${srcLang} → ${tgtLang}), and sample qualifications within <strong>1–2 business days</strong>. Shortlisted candidates will be invited for onboarding and rate agreement.
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
  sendAdminLeadNotification,
  sendCustomerLeadConfirmation,
  sendLinguistApplicationNotifications
};
