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
  if (percentage >= 50) return 'C';
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

  // Create PDF in Portrait A4
  const doc = new PDFDocument({
    layout: 'portrait',
    size: 'A4',
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const stream = fs.createWriteStream(localPath);
  doc.pipe(stream);

  const W = doc.page.width;   // 595.28
  const H = doc.page.height;  // 841.89

  // 1. Draw Template Background
  try {
    const templatePath = path.join(__dirname, '../assets/final_template.png');
    doc.image(templatePath, 0, 0, { width: W, height: H });
  } catch (err) {
    console.error('Template image not found at assets/final_template.png');
    doc.rect(0, 0, W, H).fill('#ffffff'); // fallback white
  }

  // 2. Overlay Passport Photo (Top Right)
  if (photoUrl) {
    try {
      let photoBuffer;
      if (photoUrl.startsWith('http')) {
        const axios = require('axios');
        const res = await axios.get(photoUrl, { responseType: 'arraybuffer' });
        photoBuffer = Buffer.from(res.data);
      } else {
        photoBuffer = fs.readFileSync(path.join(__dirname, '..', photoUrl));
      }
      
      const photoWidth = 60;
      const photoHeight = 80;
      doc.image(photoBuffer, 505, 130, { width: photoWidth, height: photoHeight });
      // Add a border to the photo
      doc.rect(505, 130, photoWidth, photoHeight).lineWidth(1).stroke('#333333');
      
      // Overlay Stamp
      try {
        const stampPath = path.join(__dirname, '../assets/stamp.png');
        doc.image(stampPath, 519, 185, { width: 55, height: 55 });
      } catch (err) {
        console.warn('Stamp image not found');
      }
    } catch (err) {
      console.warn('Failed to load passport photo for certificate:', err.message);
    }
  }

  // 3. Overlay Candidate Name
  doc.font('Helvetica-Bold').fontSize(22).fillColor('#000000');
  doc.text(candidateName.toUpperCase(), 0, 285, { width: W, align: 'center' });

  // 4. Overlay Course Name
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#000000');
  doc.text(tradeName.toUpperCase(), 0, 400, { width: W, align: 'center' });

  // 5. Overlay Issue Date
  // Extracting day and month
  const d = new Date(issueDate);
  const day = d.getDate();
  const suffix = (day % 10 === 1 && day !== 11) ? 'st' : (day % 10 === 2 && day !== 12) ? 'nd' : (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
  const monthStr = d.toLocaleDateString('en-IN', { month: 'long' });
  const yearStr = d.getFullYear();
  const issuedString = `${day}${suffix} day of ${monthStr}, ${yearStr}`;

  doc.font('Helvetica-Bold').fontSize(14).fillColor('#000000');
  doc.text(issuedString, 45, 538, { width: W, align: 'center' });

  // 6. Draw QR Code (Bottom Left)
  const qrX = 50;
  const qrY = 640;
  doc.image(qrBuffer, qrX, qrY, { width: 70, height: 70 });
  
  // QR text (Issue Date under QR)
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff');
  doc.rect(qrX, qrY + 70, 70, 12).fill('#000000');
  doc.fillColor('#ffffff').text(`Issue Date: ${d.toLocaleDateString('en-IN')}`, qrX, qrY + 72, { width: 70, align: 'center' });

  // 7. Overlay Marks Table
  doc.fillColor('#000000').fontSize(10);
  const tableY = 805; 
  
  // Theory (Using score)
  doc.text(`${score}/${totalMarks}`, 165, tableY, { width: 60, align: 'center' });
  // Practical
  doc.text('N/A', 230, tableY, { width: 60, align: 'center' });
  // Total
  doc.text(`${score}/${totalMarks}`, 290, tableY, { width: 60, align: 'center' });
  // Percentage
  doc.text(`${percentage}%`, 355, tableY, { width: 60, align: 'center' });
  // Grade
  doc.text(grade, 410, tableY, { width: 60, align: 'center' });

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
    // Use API base URL for downloads
    const frontendUrl = process.env.FRONTEND_URL || 'http://cetcf.org';
    const baseUrl = frontendUrl + '/api';
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
