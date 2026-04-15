'use strict';
/**
 * Certificate Generation Service
 * Creates PDF certificates with QR codes using PDFKit
 */
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const storage = require('./storage');

/**
 * Calculate grade from percentage
 */
function calculateGrade(percentage) {
  if (percentage >= 85) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 67) return 'C';
  return null; // Fail
}

/**
 * Generate certificate number
 * Format: CETC/YYYY/TRADECODE/XXXXXX
 */
function generateCertNumber(tradeCode, sequenceNumber) {
  const year = new Date().getFullYear();
  const seq = String(sequenceNumber).padStart(6, '0');
  return `CETC/${year}/${tradeCode.toUpperCase()}/${seq}`;
}

/**
 * Generate QR code as data URL
 */
async function generateQRCode(verifyUrl) {
  return await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: 'M',
    width: 150,
    margin: 1,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });
}

/**
 * Generate a certificate PDF
 * @param {Object} data - Certificate data
 * @param {string} data.candidateName - Full name
 * @param {string} data.tradeName - Trade name
 * @param {string} data.tradeCode - Trade code
 * @param {string} data.certNumber - Certificate number
 * @param {number} data.score - Marks scored
 * @param {number} data.totalMarks - Total marks
 * @param {string} data.grade - A/B/C
 * @param {string} data.issueDate - ISO date string
 * @param {string} data.photoUrl - Candidate photo URL (optional)
 * @returns {Promise<{ pdfPath, qrUrl, localPath }>}
 */
async function generateCertificatePDF(data) {
  const {
    candidateName,
    tradeName,
    tradeCode,
    certNumber,
    score,
    totalMarks,
    grade,
    issueDate,
    photoUrl,
  } = data;

  const percentage = Math.round((score / totalMarks) * 100);
  const formattedDate = new Date(issueDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const certBaseUrl = process.env.CERT_BASE_URL || 'http://localhost:5000';
  const verifyUrl = `${certBaseUrl}/verify?cert=${encodeURIComponent(certNumber)}`;

  // Generate QR code
  const qrDataUrl = await generateQRCode(verifyUrl);
  const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

  // Create temp directory
  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const pdfFileName = `${certNumber.replace(/\//g, '-')}.pdf`;
  const localPath = path.join(tempDir, pdfFileName);

  // Create PDF
  const doc = new PDFDocument({
    layout: 'landscape',
    size: 'A4',
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const stream = fs.createWriteStream(localPath);
  doc.pipe(stream);

  const W = doc.page.width;   // 841.89
  const H = doc.page.height;  // 595.28

  // ── Background ──────────────────────────────────────────────────────
  // Deep navy background
  doc.rect(0, 0, W, H).fill('#0f172a');

  // Gold border - outer
  doc.rect(12, 12, W - 24, H - 24).lineWidth(3).stroke('#d4af37');
  // Gold border - inner
  doc.rect(20, 20, W - 40, H - 40).lineWidth(1).stroke('#d4af37');

  // Subtle corner decorations
  const cornerSize = 30;
  [[20, 20], [W - 50, 20], [20, H - 50], [W - 50, H - 50]].forEach(([x, y]) => {
    doc.rect(x, y, cornerSize, cornerSize).lineWidth(2).stroke('#d4af37');
  });

  // Header band
  doc.rect(0, 0, W, 90).fill('#1e293b');
  doc.rect(0, 88, W, 4).fill('#d4af37');

  // ── Organization Header ─────────────────────────────────────────────
  doc.font('Helvetica-Bold').fontSize(26).fillColor('#d4af37').text('CETC FOUNDATION', 0, 22, { align: 'center' });
  doc.font('Helvetica').fontSize(11).fillColor('#94a3b8').text('Council for Education, Training and Certification Foundation', 0, 52, { align: 'center' });
  doc.font('Helvetica').fontSize(9).fillColor('#64748b').text('ISO 9001:2015 Certified  |  Section 8 Company, MCA  |  NGO Darpan Registered', 0, 68, { align: 'center' });

  // ── Certificate Title ───────────────────────────────────────────────
  doc.font('Helvetica').fontSize(13).fillColor('#94a3b8').text('CERTIFICATE OF COMPETENCY', 0, 108, { align: 'center' });
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#ffffff').text('This is to certify that', 0, 130, { align: 'center' });

  // ── Candidate Name Highlight ────────────────────────────────────────
  doc.rect(W / 2 - 220, 158, 440, 50).fill('#1e3a5f').stroke('#d4af37');
  doc.font('Helvetica-Bold').fontSize(28).fillColor('#d4af37').text(candidateName.toUpperCase(), W / 2 - 220, 168, { width: 440, align: 'center' });

  // ── Body Text ───────────────────────────────────────────────────────
  doc.font('Helvetica').fontSize(13).fillColor('#e2e8f0').text(
    'has successfully completed the skill assessment and earned certification in',
    0, 220, { align: 'center' }
  );

  doc.font('Helvetica-Bold').fontSize(20).fillColor('#38bdf8').text(tradeName.toUpperCase(), 0, 245, { align: 'center' });

  // Score and grade box
  doc.rect(W / 2 - 180, 278, 180, 55).fill('#0f2942').stroke('#d4af37');
  doc.font('Helvetica').fontSize(10).fillColor('#94a3b8').text('SCORE', W / 2 - 180, 285, { width: 180, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(22).fillColor('#ffffff').text(`${score} / ${totalMarks}`, W / 2 - 180, 298, { width: 180, align: 'center' });

  doc.rect(W / 2 + 5, 278, 100, 55).fill('#0f2942').stroke('#d4af37');
  doc.font('Helvetica').fontSize(10).fillColor('#94a3b8').text('GRADE', W / 2 + 5, 285, { width: 100, align: 'center' });
  const gradeColor = grade === 'A' ? '#10b981' : grade === 'B' ? '#3b82f6' : '#f59e0b';
  doc.font('Helvetica-Bold').fontSize(28).fillColor(gradeColor).text(grade, W / 2 + 5, 295, { width: 100, align: 'center' });

  doc.rect(W / 2 + 115, 278, 100, 55).fill('#0f2942').stroke('#d4af37');
  doc.font('Helvetica').fontSize(9).fillColor('#94a3b8').text('PERCENTAGE', W / 2 + 115, 285, { width: 100, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(20).fillColor('#ffffff').text(`${percentage}%`, W / 2 + 115, 298, { width: 100, align: 'center' });

  // ── Footer Row ──────────────────────────────────────────────────────
  const footerY = H - 115;
  doc.rect(0, footerY - 10, W, 2).fill('#d4af37');

  // Certificate Number
  doc.font('Helvetica').fontSize(9).fillColor('#94a3b8').text('CERTIFICATE NUMBER', 50, footerY + 5);
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#d4af37').text(certNumber, 50, footerY + 18);

  // Date of Issue
  doc.font('Helvetica').fontSize(9).fillColor('#94a3b8').text('DATE OF ISSUE', 50, footerY + 38);
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#ffffff').text(formattedDate, 50, footerY + 51);

  // Signature placeholder
  doc.rect(W / 2 - 80, footerY + 5, 160, 45).stroke('#334155');
  doc.font('Helvetica').fontSize(8).fillColor('#64748b').text('Authorized Signature', W / 2 - 80, footerY + 30, { width: 160, align: 'center' });
  doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text('Director, CETC Foundation', W / 2 - 80, footerY + 40, { width: 160, align: 'center' });

  // QR Code
  const qrX = W - 160;
  const qrY = footerY - 5;
  doc.image(qrBuffer, qrX, qrY, { width: 80, height: 80 });
  doc.font('Helvetica').fontSize(7).fillColor('#64748b').text('Scan to Verify', qrX - 10, qrY + 82, { width: 100, align: 'center' });

  // Verify URL text
  doc.font('Helvetica').fontSize(7).fillColor('#475569').text(`Verify: ${verifyUrl}`, 50, H - 28, { width: W - 100 });

  doc.end();

  // Wait for stream to finish
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  // Upload to storage (S3 or local)
  let pdfUrl;
  try {
    pdfUrl = await storage.uploadFile(localPath, `certificates/${pdfFileName}`, 'application/pdf');
  } catch (err) {
    // Fallback: serve from local
    const baseUrl = process.env.CERT_BASE_URL || 'http://localhost:5000';
    pdfUrl = `${baseUrl}/uploads/${pdfFileName}`;
  }

  return {
    pdfUrl,
    qrUrl: verifyUrl,
    localPath,
    certNumber,
  };
}

/**
 * Generate payment receipt PDF
 */
async function generateReceiptPDF(data) {
  const { paymentId, candidateName, tradeName, amount, transactionId, paymentDate } = data;

  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const fileName = `receipt_${paymentId}.pdf`;
  const localPath = path.join(tempDir, fileName);

  const doc = new PDFDocument({ size: 'A5', margins: { top: 40, bottom: 40, left: 50, right: 50 } });
  const stream = fs.createWriteStream(localPath);
  doc.pipe(stream);

  const W = doc.page.width;

  // Header
  doc.rect(0, 0, W, 80).fill('#0f172a');
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#d4af37').text('CETC FOUNDATION', 0, 15, { align: 'center', width: W });
  doc.font('Helvetica').fontSize(9).fillColor('#94a3b8').text('Payment Receipt', 0, 40, { align: 'center', width: W });

  doc.moveDown(3);
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#1f2937').text('RECEIPT', { align: 'center' });
  doc.moveDown(0.5);

  const rows = [
    ['Receipt No.', paymentId],
    ['Transaction ID', transactionId || 'N/A'],
    ['Candidate Name', candidateName],
    ['Trade / Course', tradeName],
    ['Amount Paid', `Rs. ${amount}/-`],
    ['Payment Date', new Date(paymentDate).toLocaleDateString('en-IN')],
    ['Status', '✅ SUCCESS'],
  ];

  rows.forEach(([label, value], index) => {
    const y = doc.y;
    doc.rect(50, y, W - 100, 24).fill(index % 2 === 0 ? '#f8fafc' : '#ffffff').stroke('#e2e8f0');
    doc.font('Helvetica').fontSize(9).fillColor('#6b7280').text(label, 60, y + 7);
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#111827').text(value, 200, y + 7);
    doc.moveDown(1);
  });

  doc.moveDown(1);
  doc.font('Helvetica').fontSize(8).fillColor('#9ca3af').text('This is a computer generated receipt. No signature required.', { align: 'center' });

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  let pdfUrl;
  try {
    pdfUrl = await storage.uploadFile(localPath, `receipts/${fileName}`, 'application/pdf');
  } catch {
    pdfUrl = `/api/payments/receipt-file/${fileName}`;
  }

  return { pdfUrl, localPath };
}

module.exports = { generateCertificatePDF, generateReceiptPDF, generateCertNumber, calculateGrade };
