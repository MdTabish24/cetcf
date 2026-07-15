const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

async function testLayout() {
  const W = 595.28;
  const H = 841.89;

  const doc = new PDFDocument({
    layout: 'portrait',
    size: 'A4',
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const localPath = path.join(__dirname, 'test-cert-output.pdf');
  const stream = fs.createWriteStream(localPath);
  doc.pipe(stream);

  // Background
  const templatePath = path.join(__dirname, 'assets/final_template.png');
  doc.image(templatePath, 0, 0, { width: W, height: H });

  // Photo Placeholder
  // 480, 80 might be good, let's keep it but slightly adjusted
  doc.rect(505, 130, 60, 80).fill('#cccccc');

  // Stamp
  const stampPath = path.join(__dirname, 'assets/stamp.png');
  try { doc.image(stampPath, 519, 185, { width: 55, height: 55 }); } catch (e) { }

  // Name - adjust to sit on the line
  doc.font('Helvetica-Bold').fontSize(22).fillColor('#000000');
  doc.text('TABISH MUKHTAR AHMAD ANSARI', 0, 285, { width: W, align: 'center' });

  // Course - adjust to sit on the line
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#000000');
  doc.text('BEAUTY & WELLNESS', 0, 400, { width: W, align: 'center' });

  // Issued Date
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#000000');
  doc.text('15th day of July, 2026', 45, 538, { width: W, align: 'center' });

  // QR Code
  const qrDataUrl = await QRCode.toDataURL('http://cetcf.org/verify?cert=CETC/2026/BEAUTY/000001', {
    errorCorrectionLevel: 'M', margin: 1, width: 70, color: { dark: '#000000', light: '#ffffff' },
  });
  const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

  const qrX = 50;
  const qrY = 640;
  doc.image(qrBuffer, qrX, qrY, { width: 70, height: 70 });

  // QR text
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#000000');
  doc.rect(qrX, qrY + 70, 70, 12).fill('#000000');
  doc.fillColor('#ffffff').text('Issue Date: 15/7/2026', qrX, qrY + 72, { width: 70, align: 'center' });

  // Marks Table
  doc.fillColor('#000000').fontSize(10);
  const tableY = 805;

  // X coordinates to align with table columns
  doc.text('8/20', 165, tableY, { width: 60, align: 'center' });
  doc.text('N/A', 230, tableY, { width: 60, align: 'center' });
  doc.text('8/20', 290, tableY, { width: 60, align: 'center' });
  doc.text('40%', 355, tableY, { width: 60, align: 'center' });
  doc.text('D', 410, tableY, { width: 60, align: 'center' });

  doc.end();
  console.log('Done generating test-cert-output.pdf');
}

testLayout().catch(console.error);
