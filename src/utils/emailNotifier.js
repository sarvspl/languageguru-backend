let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  // Nodemailer optional fallback
}

async function sendAdminLeadNotification({ referenceId, name, phone, email, serviceKey, sourceLang, targetLang, pages, isInterpreter, notes, city, message }) {
  try {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'info@languageguruindia.com';
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    console.log(`[ADMIN EMAIL NOTIFICATION] Triggered for Lead ${referenceId}`);
    console.log(`  To: ${adminEmail}`);
    console.log(`  Client: ${name} (${phone})`);
    console.log(`  Service: ${serviceKey} | ${sourceLang || 'English'} -> ${targetLang || 'Hindi'}`);
    console.log(`  Pages/Qty: ${pages} | Interpreter: ${isInterpreter ? 'Yes' : 'No'}`);
    if (notes) console.log(`  Notes: ${notes}`);

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpFrom = process.env.SMTP_FROM || `"Language Guru Leads" <${smtpUser || 'leads@languageguruindia.com'}>`;

    if (nodemailer && smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const mailOptions = {
        from: smtpFrom,
        to: adminEmail,
        subject: `🔔 New Lead [${referenceId}]: ${serviceKey} from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background: #1a3a6b; color: #ffffff; padding: 18px 24px;">
              <h2 style="margin: 0; font-size: 20px;">New Lead Received — Language Guru</h2>
              <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Submission Reference: <strong>${referenceId}</strong></p>
            </div>
            <div style="padding: 24px; background: #ffffff;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; width: 35%;">Reference ID:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #1a3a6b;">${referenceId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Customer Name:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Phone / WhatsApp:</td>
                  <td style="padding: 8px 0; font-weight: bold;"><a href="tel:${phone}" style="color: #1e7fc5; text-decoration: none;">${phone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Email:</td>
                  <td style="padding: 8px 0;">${email ? `<a href="mailto:${email}" style="color: #1e7fc5; text-decoration: none;">${email}</a>` : '<span style="color:#94a3b8">Not provided</span>'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Service Type:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${serviceKey}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Languages:</td>
                  <td style="padding: 8px 0;">${sourceLang || 'English'} &rarr; ${targetLang || 'Hindi'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Pages / Duration:</td>
                  <td style="padding: 8px 0;">${pages} ${isInterpreter ? 'Day(s)' : 'Page(s)'}</td>
                </tr>
                ${city ? `<tr><td style="padding: 8px 0; color: #64748b;">City:</td><td style="padding: 8px 0;">${city}</td></tr>` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #64748b; vertical-align: top;">Notes / Message:</td>
                  <td style="padding: 8px 0; white-space: pre-line; color: #334151;">${notes || message || '<span style="color:#94a3b8">None</span>'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Received At:</td>
                  <td style="padding: 8px 0; color: #64748b;">${timestamp}</td>
                </tr>
              </table>
              <div style="margin-top: 24px; padding: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; text-align: center;">
                <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(name)}%2C%20thank%20you%20for%20contacting%20Language%20Guru%20(Ref%3A%20${referenceId})." style="display: inline-block; background: #22c55e; color: #ffffff; padding: 10px 20px; border-radius: 6px; font-weight: bold; text-decoration: none;">Reply to Client via WhatsApp</a>
              </div>
            </div>
            <div style="background: #f8fafc; padding: 12px 24px; font-size: 12px; color: #94a3b8; text-align: center;">
              Language Guru Automated Notification System &bull; Response SLA: 15–30 minutes
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`[ADMIN EMAIL NOTIFICATION] Email sent successfully via SMTP to ${adminEmail}`);
    } else {
      console.log(`[ADMIN EMAIL NOTIFICATION] SMTP credentials not configured; logged lead notification for ${referenceId}`);
    }
  } catch (err) {
    console.error('[ADMIN EMAIL NOTIFICATION ERROR]', err && err.message ? err.message : err);
  }
}

module.exports = { sendAdminLeadNotification };
