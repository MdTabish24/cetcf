const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({
  layout: 'portrait',
  size: 'A4',
  margins: { top: 0, bottom: 0, left: 0, right: 0 },
});

const outputPath = path.join(__dirname, '../temp/test_cert.pdf');
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Draw Background
doc.image(path.join(__dirname, '../assets/final_template.png'), 0, 0, { width: 595.28, height: 841.89 });

// Try to map fields
doc.font('Helvetica-Bold');
doc.fontSize(24);

// Candidate Name
doc.text('MOHAMMAD TABISH', 0, 310, { align: 'center', width: 595.28 });

// Course Name
doc.fontSize(18);
doc.text('COMPUTER HARDWARE AND NETWORKING', 0, 420, { align: 'center', width: 595.28 });

// Issued Date
doc.fontSize(14);
doc.text('04 July 2026', 0, 530, { align: 'center', width: 595.28 });

// Marks Table
// Let's guess the X, Y for the marks table cells based on the bottom.
// It looks like it's around Y=780
const tableY = 780;
doc.fontSize(12);
doc.text('85/100', 160, tableY, { align: 'center', width: 60 }); // Theory
doc.text('N/A', 230, tableY, { align: 'center', width: 60 }); // Practical
doc.text('85/100', 300, tableY, { align: 'center', width: 60 }); // Total
doc.text('85%', 370, tableY, { align: 'center', width: 60 }); // Percentage
doc.text('A', 440, tableY, { align: 'center', width: 60 }); // Grade

doc.end();

console.log('Test PDF generated at', outputPath);
