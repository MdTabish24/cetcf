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

  // Photo
  // Using a placeholder box for photo
  doc.rect(480, 80, 70, 90).fill('#cccccc');
  
  // Stamp
  const stampPath = path.join(__dirname, 'assets/stamp.png');
  doc.image(stampPath, 470, 130, { width: 70, height: 70 });

  // Name
  doc.font('Helvetica-Bold').fontSize(22).fillColor('#000000');
  doc.text('MUSKAN SAMIR NAIK', 0, 280, { width: W, align: 'center' });

  // Course
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#000000');
  doc.text('AC & Refrigeration Technician (HVAC)', 0, 410, { width: W, align: 'center' });

  // Issue Date (Bottom Left?)
  // Actually, in the screenshot, "Issued on this 23th day of April, 2026"
  // Let's place it at 580
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#000000');
  doc.text('Issued on this 23th day of April, 2026', 0, 580, { width: W, align: 'center' });

  // Center Name
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#2b3d5b'); // A dark blue color
  doc.text('Universal Beauty Academy', 0, 660, { width: W, align: 'center' });
  doc.text('Bhiwandi, Thane, Maharashtra', 0, 675, { width: W, align: 'center' });
  doc.text('Affiliated Center Code: CETCF/TC/137', 0, 690, { width: W, align: 'center' });

  // QR Code
  const qrDataUrl = await QRCode.toDataURL('http://cetcf.org/verify?cert=CETC/2026/BEAUTY/123', {
    errorCorrectionLevel: 'M', margin: 1, width: 100, color: { dark: '#000000', light: '#ffffff' },
  });
  const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  doc.image(qrBuffer, 50, 720, { width: 80, height: 80 });
  
  // QR text
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#000000');
  doc.rect(50, 800, 80, 10).fill('#000000');
  doc.fillColor('#ffffff').text('Issue Date: 23/04/2026', 50, 801, { width: 80, align: 'center' });

  // Marks Table
  doc.fillColor('#000000').fontSize(10);
  const tableY = 810; 
  
  // Theory (Using score)
  doc.text('75/100', 210, tableY, { width: 50, align: 'center' });
  // Practical
  doc.text('65/100', 280, tableY, { width: 50, align: 'center' });
  // Total
  doc.text('140/200', 350, tableY, { width: 60, align: 'center' });
  // Percentage
  doc.text('70%', 430, tableY, { width: 50, align: 'center' });
  // Grade
  doc.text('A', 500, tableY, { width: 40, align: 'center' });

  doc.end();
  console.log('Done');
}

testLayout();
