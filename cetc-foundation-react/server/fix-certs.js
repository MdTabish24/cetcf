const { Pool } = require('pg');
const { generateCertificatePDF, generateCertNumber, calculateGrade } = require('./services/certificate');
const crypto = require('crypto');

const db = new Pool({
  connectionString: 'postgresql://postgres:cetcf2024@localhost:5432/cetcf_db'
});

async function fixCertificates() {
  try {
    // Find exams that passed but have no certificate
    const exams = await db.query(`
      SELECT e.*, c.user_id, c.id as cand_id, c.trade_id as cand_trade_id,
             t.passing_marks, t.name as trade_name, t.code as trade_code,
             u.name as user_name, u.mobile, u.email, u.photo_url
      FROM exams e 
      JOIN candidates c ON e.candidate_id = c.id
      JOIN trades t ON e.trade_id = t.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN certificates cert ON e.id = cert.exam_id
      WHERE e.result = 'pass' AND cert.id IS NULL
    `);

    console.log(`Found ${exams.rows.length} passed exams without certificates.`);

    for (const exam of exams.rows) {
      const percentage = (exam.score / exam.total_questions) * 100;
      const grade = calculateGrade(percentage) || 'D';

      const seqResult = await db.query(
        `SELECT COUNT(*) + 1 as seq FROM certificates WHERE trade_id = $1`,
        [exam.cand_trade_id]
      );
      const seq = parseInt(seqResult.rows[0].seq);
      const certNumber = generateCertNumber(exam.trade_code, seq);

      console.log(`Generating certificate ${certNumber} for ${exam.user_name} (Score: ${percentage}%)...`);

      const { pdfUrl, qrUrl } = await generateCertificatePDF({
        candidateName: exam.user_name || 'Candidate',
        tradeName: exam.trade_name,
        tradeCode: exam.trade_code,
        certNumber,
        score: exam.score,
        totalMarks: exam.total_questions,
        grade,
        issueDate: new Date().toISOString(),
        photoUrl: exam.photo_url,
      });

      await db.query(
        `INSERT INTO certificates (candidate_id, exam_id, cert_number, trade_id, grade, score, percentage, qr_url, pdf_url, verification_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [exam.cand_id, exam.id, certNumber, exam.cand_trade_id, grade, exam.score, percentage.toFixed(2), qrUrl, pdfUrl, crypto.createHash('sha256').update(certNumber).digest('hex')]
      );

      console.log(`Saved certificate ${certNumber}.`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    db.end();
  }
}

fixCertificates();
