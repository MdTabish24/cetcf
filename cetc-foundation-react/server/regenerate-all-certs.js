require('dotenv').config();
const { Pool } = require('pg');
const { generateCertificatePDF } = require('./services/certificate');

// Use the exact database config from the app
const db = require('./db/index'); 

async function regenerateAllCerts() {
  try {
    console.log('Connecting to database...');
    // Find all passed exams
    const result = await db.query(`
      SELECT 
        e.id as exam_id,
        c.id as candidate_id,
        c.full_name as candidate_name,
        c.photo_url,
        t.id as trade_id,
        t.trade_name,
        t.trade_code,
        e.score,
        e.total_marks,
        e.percentage,
        e.grade,
        e.exam_date,
        cert.certificate_number,
        cert.id as cert_id
      FROM exams e
      JOIN candidates c ON e.candidate_id = c.id
      JOIN trades t ON e.trade_id = t.id
      JOIN certificates cert ON cert.exam_id = e.id
      WHERE e.status = 'passed'
    `);

    const certs = result.rows;
    console.log(`Found ${certs.length} certificates to regenerate...`);

    for (const data of certs) {
      console.log(`Regenerating certificate ${data.certificate_number} for ${data.candidate_name}...`);
      
      const certData = {
        candidateName: data.candidate_name,
        tradeName: data.trade_name,
        tradeCode: data.trade_code,
        certNumber: data.certificate_number,
        score: data.score,
        totalMarks: data.total_marks,
        grade: data.grade,
        issueDate: data.exam_date,
        photoUrl: data.photo_url
      };

      const { pdfUrl } = await generateCertificatePDF(certData);

      // Update the pdf_url in db
      await db.query(
        'UPDATE certificates SET pdf_url = $1 WHERE id = $2',
        [pdfUrl, data.cert_id]
      );
      
      console.log(`Updated DB with new pdfUrl: ${pdfUrl}`);
    }

    console.log('All done!');
  } catch (err) {
    console.error('Error during regeneration:', err);
  } finally {
    db.pool.end();
  }
}

regenerateAllCerts();
