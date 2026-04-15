'use strict';
/**
 * Notification Service
 * SMS (MSG91), WhatsApp, and Email (SendGrid/Nodemailer)
 */
const axios = require('axios');
const nodemailer = require('nodemailer');

const DEV_MODE = process.env.DEV_MODE === 'true';

// ── SMS via MSG91 ─────────────────────────────────────────────────────

async function sendSMS(mobile, message) {
  if (DEV_MODE || !process.env.MSG91_AUTH_KEY) {
    console.log(`[DEV SMS] To: ${mobile}\n${message}`);
    return { success: true, mock: true };
  }

  try {
    const response = await axios.post(
      'https://api.msg91.com/api/sendhttp.php',
      null,
      {
        params: {
          authkey: process.env.MSG91_AUTH_KEY,
          mobiles: `91${mobile}`,
          message,
          sender: process.env.MSG91_SENDER_ID || 'CETCFN',
          route: '4',
        },
        timeout: 10000,
      }
    );
    console.log('[SMS] Sent:', response.data);
    return { success: true };
  } catch (err) {
    console.error('[SMS] Failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ── WhatsApp via Interakt ─────────────────────────────────────────────

async function sendWhatsApp(mobile, templateName, components = []) {
  if (DEV_MODE || !process.env.WHATSAPP_API_KEY) {
    console.log(`[DEV WhatsApp] To: ${mobile}, Template: ${templateName}`);
    return { success: true, mock: true };
  }

  try {
    const response = await axios.post(
      process.env.WHATSAPP_API_URL,
      {
        countryCode: '+91',
        phoneNumber: mobile,
        callbackData: 'cetcf_notification',
        type: 'Template',
        template: { name: templateName, languageCode: 'en', components },
      },
      {
        headers: {
          Authorization: `Basic ${process.env.WHATSAPP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    return { success: true, data: response.data };
  } catch (err) {
    console.error('[WhatsApp] Failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ── Email via SendGrid/Nodemailer ─────────────────────────────────────

let transporter;

function getEmailTransporter() {
  if (transporter) return transporter;

  if (DEV_MODE || !process.env.SENDGRID_API_KEY) {
    // Dev: use ethereal or console
    transporter = {
      sendMail: async (opts) => {
        console.log(`[DEV Email] To: ${opts.to}\nSubject: ${opts.subject}\n${opts.text || '(HTML)'}`);
        return { messageId: `dev_${Date.now()}` };
      },
    };
    return transporter;
  }

  // Production: SendGrid as SMTP relay
  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY,
    },
  });
  return transporter;
}

async function sendEmail(to, subject, htmlContent, textContent) {
  const mailer = getEmailTransporter();
  try {
    const info = await mailer.sendMail({
      from: `CETC Foundation <${process.env.SENDGRID_FROM_EMAIL || 'noreply@cetcfoundation.org'}>`,
      to,
      subject,
      text: textContent || '',
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email] Failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ── Notification Templates ────────────────────────────────────────────

async function notifyRegistration(mobile, email, name) {
  const msg = `Welcome to CETC Foundation, ${name}! Your account is successfully created. Login at cetcfoundation.org`;
  await sendSMS(mobile, msg);
  if (email) {
    await sendEmail(
      email,
      'Welcome to CETC Foundation! 🎓',
      `<h2>Welcome, ${name}!</h2><p>Your account is successfully created on CETC Foundation platform. You can now enroll for skill certification courses.</p>`,
      msg
    );
  }
}

async function notifyPaymentSuccess(mobile, email, name, tradeName, amount, transactionId) {
  const msg = `CETC Foundation: Payment of Rs.${amount} confirmed for ${tradeName} certification. TxnID: ${transactionId}. Your enrollment is now active!`;
  await sendSMS(mobile, msg);
  await sendWhatsApp(mobile, 'payment_confirmation', [
    { type: 'body', parameters: [{ type: 'text', text: name }, { type: 'text', text: tradeName }, { type: 'text', text: `Rs.${amount}` }] },
  ]);
  if (email) {
    await sendEmail(email, `Payment Confirmed — ${tradeName} Enrollment`, `<h2>Payment Successful!</h2><p>Hi ${name},</p><p>Rs.${amount} payment for <strong>${tradeName}</strong> certified. TxnID: ${transactionId}</p>`, msg);
  }
}

async function notifyExamResult(mobile, email, name, tradeName, result, score, totalMarks, certNumber) {
  if (result === 'pass') {
    const msg = `🎉 Congratulations ${name}! You PASSED the ${tradeName} exam with ${score}/${totalMarks} marks. Certificate: ${certNumber}. Download at cetcfoundation.org`;
    await sendSMS(mobile, msg);
    await sendWhatsApp(mobile, 'exam_result_pass', [
      { type: 'body', parameters: [{ type: 'text', text: name }, { type: 'text', text: tradeName }, { type: 'text', text: `${score}/${totalMarks}` }, { type: 'text', text: certNumber }] },
    ]);
    if (email) {
      await sendEmail(email, `🎉 You Passed — ${tradeName} Certificate Ready!`, `<h2>Congratulations ${name}!</h2><p>You have passed the ${tradeName} exam with ${score}/${totalMarks} marks. Your certificate number is <strong>${certNumber}</strong>.</p>`, msg);
    }
  } else {
    const msg = `CETC Foundation: You attempted the ${tradeName} exam. Score: ${score}/${totalMarks}. Keep practicing! You can retry up to 3 attempts.`;
    await sendSMS(mobile, msg);
    if (email) {
      await sendEmail(email, `${tradeName} Exam Result`, `<p>Hi ${name}, you scored ${score}/${totalMarks} in ${tradeName}. You can retry the exam. Best of luck!</p>`, msg);
    }
  }
}

async function notifyCertificateReady(mobile, email, name, certNumber, pdfUrl) {
  const msg = `CETC Foundation: Your certificate ${certNumber} is ready! Download: ${pdfUrl}`;
  await sendSMS(mobile, msg);
  await sendWhatsApp(mobile, 'certificate_ready', [
    { type: 'body', parameters: [{ type: 'text', text: name }, { type: 'text', text: certNumber }, { type: 'text', text: pdfUrl }] },
  ]);
  if (email) {
    await sendEmail(email, 'Your CETCF Certificate is Ready! 🎓', `<h2>Certificate Ready!</h2><p>Hi ${name}, your certificate <strong>${certNumber}</strong> is ready. <a href="${pdfUrl}">Download Certificate</a></p>`, msg);
  }
}

async function notifyPartnerApproval(mobile, email, orgName, status, reason) {
  const msg = status === 'approved'
    ? `CETC Foundation: Congratulations! ${orgName} has been approved as an Authorized Assessment Center (AAC). Login at cetcfoundation.org/partner`
    : `CETC Foundation: Partner application for ${orgName} could not be approved. Reason: ${reason}. Contact support for assistance.`;

  await sendSMS(mobile, msg);
  if (email) {
    await sendEmail(email, `Partner Application ${status === 'approved' ? 'Approved ✅' : 'Status Update'}`, `<p>${msg}</p>`, msg);
  }
}

async function notifyExamReminder(mobile, name, tradeName, examDate) {
  const msg = `CETC Foundation: Reminder — Your ${tradeName} exam is scheduled tomorrow (${examDate}). Login at cetcfoundation.org to take the exam. Best of luck, ${name}!`;
  await sendSMS(mobile, msg);
}

module.exports = {
  sendSMS,
  sendWhatsApp,
  sendEmail,
  notifyRegistration,
  notifyPaymentSuccess,
  notifyExamResult,
  notifyCertificateReady,
  notifyPartnerApproval,
  notifyExamReminder,
};
