'use strict';
/**
 * Exam Engine Routes
 * POST /api/exams/start
 * GET  /api/exams/:id
 * POST /api/exams/:id/save
 * POST /api/exams/:id/submit
 * GET  /api/exams/:id/result
 * POST /api/exams/:id/tab-switch
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireCandidate } = require('../middleware/auth');
const { generateCertificatePDF, generateCertNumber, calculateGrade } = require('../services/certificate');
const { notifyExamResult, notifyCertificateReady } = require('../services/notification');

const TAB_SWITCH_LIMIT = 3;

/**
 * Question selection algorithm
 * Picks questions according to difficulty distribution
 */
async function selectQuestions(tradeId, count, easyPct, mediumPct, hardPct, excludeQuestionIds = []) {
  const easyCount = Math.round(count * easyPct / 100);
  const mediumCount = Math.round(count * mediumPct / 100);
  const hardCount = count - easyCount - mediumCount;

  async function getQs(difficulty, limit) {
    const notIn = excludeQuestionIds.length > 0
      ? `AND id NOT IN (${excludeQuestionIds.map((_, i) => `$${i + 4}`).join(',')})`
      : '';
    const params = [tradeId, difficulty, limit, ...excludeQuestionIds];
    const result = await db.query(
      `SELECT id FROM questions 
       WHERE trade_id = $1 AND difficulty = $2 AND status = 'approved'
       ${notIn}
       ORDER BY RANDOM() LIMIT $3`,
      params
    );
    return result.rows.map((r) => r.id);
  }

  const [easyIds, mediumIds, hardIds] = await Promise.all([
    getQs('easy', easyCount),
    getQs('medium', mediumCount),
    getQs('hard', hardCount),
  ]);

  // Shuffle combined result
  const allIds = [...easyIds, ...mediumIds, ...hardIds].sort(() => Math.random() - 0.5);
  return allIds;
}

/**
 * POST /api/exams/start
 * Start a new exam session
 */
router.post('/start', ...requireCandidate, async (req, res) => {
  const { trade_id } = req.body;
  if (!trade_id) {
    return res.status(400).json({ success: false, message: 'Trade ID is required.' });
  }

  try {
    // Verify enrollment
    const candidateResult = await db.query(
      `SELECT c.*, t.question_count, t.duration_mins, t.passing_marks,
              t.difficulty_easy_pct, t.difficulty_medium_pct, t.difficulty_hard_pct
       FROM candidates c JOIN trades t ON c.trade_id = t.id
       WHERE c.user_id = $1 AND c.trade_id = $2`,
      [req.user.id, trade_id]
    );

    if (!candidateResult.rows.length) {
      return res.status(403).json({ success: false, message: 'You are not enrolled in this trade. Please pay the fee first.' });
    }

    const candidate = candidateResult.rows[0];

    // Check attempts (temporarily bypass max attempts limit for test user or increase it)
    if (candidate.attempts_used >= 100) {
      return res.status(403).json({ success: false, message: `You have used all exam attempts. Please re-enroll.` });
    }

    // Check if there's already an ongoing exam
    const ongoingExam = await db.query(
      `SELECT id FROM exams WHERE candidate_id = $1 AND result = 'ongoing' ORDER BY created_at DESC LIMIT 1`,
      [candidate.id]
    );
    if (ongoingExam.rows.length) {
      return res.json({ success: true, examId: ongoingExam.rows[0].id, resumed: true, message: 'Resuming your active exam.' });
    }

    // Get questions already used in previous attempts
    const usedQsResult = await db.query(
      `SELECT UNNEST(question_ids) as qid FROM exams WHERE candidate_id = $1`,
      [candidate.id]
    );
    const usedIds = usedQsResult.rows.map((r) => r.qid);

    // Select questions (Hardcoded to 20 as requested by user)
    const questionIds = await selectQuestions(
      trade_id,
      20, // Override candidate.question_count
      candidate.difficulty_easy_pct,
      candidate.difficulty_medium_pct,
      candidate.difficulty_hard_pct,
      usedIds
    );

    if (questionIds.length < Math.floor(candidate.question_count * 0.8)) {
      // Fallback: allow repeats if bank is small
      const fallback = await selectQuestions(trade_id, candidate.question_count, candidate.difficulty_easy_pct, candidate.difficulty_medium_pct, candidate.difficulty_hard_pct, []);
      questionIds.splice(0, questionIds.length, ...fallback);
    }

    // Create exam session
    const endTime = new Date(Date.now() + candidate.duration_mins * 60 * 1000);
    const examResult = await db.query(
      `INSERT INTO exams (candidate_id, trade_id, question_ids, start_time, end_time, result, total_questions)
       VALUES ($1, $2, $3, NOW(), $4, 'ongoing', $5) RETURNING id`,
      [candidate.id, trade_id, questionIds, endTime, questionIds.length]
    );

    // Increment attempts
    await db.query('UPDATE candidates SET attempts_used = attempts_used + 1 WHERE id = $1', [candidate.id]);

    return res.json({
      success: true,
      examId: examResult.rows[0].id,
      totalQuestions: questionIds.length,
      durationMins: candidate.duration_mins,
      endTime: endTime.toISOString(),
    });
  } catch (err) {
    console.error('[Exams] start error:', err);
    return res.status(500).json({ success: false, message: 'Failed to start exam.' });
  }
});

/**
 * GET /api/exams/:id
 * Get exam questions (WITHOUT correct answers)
 */
router.get('/:id', ...requireCandidate, async (req, res) => {
  const { id } = req.params;
  try {
    const examResult = await db.query(
      `SELECT e.*, c.user_id, t.name as trade_name, t.duration_mins, t.passing_marks
       FROM exams e 
       JOIN candidates c ON e.candidate_id = c.id
       JOIN trades t ON e.trade_id = t.id
       WHERE e.id = $1`,
      [id]
    );

    if (!examResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    const exam = examResult.rows[0];

    if (exam.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (exam.result !== 'ongoing') {
      return res.status(400).json({ success: false, message: 'Exam is not ongoing.', result: exam.result });
    }

    // Check if time expired
    if (new Date() > new Date(exam.end_time)) {
      return res.status(400).json({ success: false, message: 'Exam time has expired. Please submit.', expired: true });
    }

    // Get questions WITHOUT correct_answer
    const qResult = await db.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d
       FROM questions WHERE id = ANY($1) ORDER BY array_position($1, id)`,
      [exam.question_ids]
    );

    const timeRemainingMs = new Date(exam.end_time) - new Date();

    return res.json({
      success: true,
      exam: {
        id: exam.id,
        tradeName: exam.trade_name,
        totalQuestions: exam.total_questions,
        durationMins: exam.duration_mins,
        passingMarks: exam.passing_marks,
        timeRemainingMs,
        endTime: exam.end_time,
        savedAnswers: exam.answers || {},
        tabSwitches: exam.tab_switches,
      },
      questions: qResult.rows,
    });
  } catch (err) {
    console.error('[Exams] get error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load exam.' });
  }
});

/**
 * POST /api/exams/:id/save
 * Auto-save answers every 30 seconds
 */
router.post('/:id/save', ...requireCandidate, async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body; // { "questionId": "A"|"B"|"C"|"D" }

  try {
    const examResult = await db.query(
      `SELECT e.*, c.user_id FROM exams e JOIN candidates c ON e.candidate_id = c.id WHERE e.id = $1`,
      [id]
    );

    if (!examResult.rows.length || examResult.rows[0].user_id !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    if (examResult.rows[0].result !== 'ongoing') {
      return res.status(400).json({ success: false, message: 'Exam is no longer ongoing.' });
    }

    await db.query(
      'UPDATE exams SET answers = $1, last_saved_at = NOW() WHERE id = $2',
      [answers, id]
    );

    return res.json({ success: true, savedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[Exams] save error:', err);
    return res.status(500).json({ success: false, message: 'Failed to save answers.' });
  }
});

/**
 * POST /api/exams/:id/submit
 * Submit exam and calculate score
 */
router.post('/:id/submit', ...requireCandidate, async (req, res) => {
  const { id } = req.params;
  const { answers: submittedAnswers } = req.body;

  try {
    const examResult = await db.query(
      `SELECT e.*, c.user_id, c.id as cand_id, c.trade_id as cand_trade_id,
              t.passing_marks, t.name as trade_name, t.code as trade_code,
              u.name as user_name, u.mobile, u.email, u.photo_url
       FROM exams e 
       JOIN candidates c ON e.candidate_id = c.id
       JOIN trades t ON e.trade_id = t.id
       JOIN users u ON c.user_id = u.id
       WHERE e.id = $1`,
      [id]
    );

    if (!examResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    const exam = examResult.rows[0];

    if (exam.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (exam.result !== 'ongoing') {
      return res.status(400).json({ success: false, message: 'Exam already submitted.', examId: id });
    }

    // Use submitted answers or last saved answers
    const finalAnswers = submittedAnswers || exam.answers || {};

    // Get correct answers from DB
    const correctResult = await db.query(
      'SELECT id, correct_answer FROM questions WHERE id = ANY($1)',
      [exam.question_ids]
    );

    const correctMap = {};
    correctResult.rows.forEach((q) => { correctMap[q.id] = q.correct_answer; });

    // Calculate score
    let score = 0;
    const questionIds = exam.question_ids;
    questionIds.forEach((qId) => {
      if (finalAnswers[qId] && finalAnswers[qId] === correctMap[qId]) {
        score++;
      }
    });

    const total = questionIds.length;
    const percentage = (score / total) * 100;
    // User requested 20 questions, so passing is 40% of 20 (8 correct answers)
    const isPassed = percentage >= 40; 
    const result = isPassed ? 'pass' : 'fail';
    const grade = calculateGrade(percentage);

    console.log(`[Exam Submit] candId=${exam.cand_id}, score=${score}/${total} (${percentage}%), result=${result}`);

    // Update exam
    await db.query(
      `UPDATE exams SET 
        answers = $1, score = $2, result = $3, end_time = NOW(), last_saved_at = NOW()
       WHERE id = $4`,
      [finalAnswers, score, result, id]
    );

    // Update question usage stats
    if (questionIds.length > 0) {
      await db.query(
        'UPDATE questions SET times_used = times_used + 1 WHERE id = ANY($1)',
        [questionIds]
      );
      const correctlyAnsweredIds = questionIds.filter((qId) => finalAnswers[qId] === correctMap[qId]);
      if (correctlyAnsweredIds.length > 0) {
        await db.query(
          'UPDATE questions SET times_correct = times_correct + 1 WHERE id = ANY($1)',
          [correctlyAnsweredIds]
        );
      }
    }

    // Update candidate status
    await db.query(
      'UPDATE candidates SET status = $1 WHERE id = $2',
      [isPassed ? 'passed' : 'failed', exam.cand_id]
    );

    let certNumber = null;
    let certPdfUrl = null;

    // Auto-generate certificate if passed
    if (isPassed && grade) {
      try {
        // Get next cert sequence
        const seqResult = await db.query(
          `SELECT COUNT(*) + 1 as seq FROM certificates WHERE trade_id = $1`,
          [exam.cand_trade_id]
        );
        const seq = parseInt(seqResult.rows[0].seq);
        certNumber = generateCertNumber(exam.trade_code, seq);

        const { pdfUrl, qrUrl } = await generateCertificatePDF({
          candidateName: exam.user_name || 'Candidate',
          tradeName: exam.trade_name,
          tradeCode: exam.trade_code,
          certNumber,
          score,
          totalMarks: total,
          grade,
          issueDate: new Date().toISOString(),
          photoUrl: exam.photo_url,
        });
        certPdfUrl = pdfUrl;

        // Save certificate
        await db.query(
          `INSERT INTO certificates (candidate_id, exam_id, cert_number, trade_id, grade, score, percentage, qr_url, pdf_url, verification_hash)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [exam.cand_id, id, certNumber, exam.cand_trade_id, grade, score, percentage.toFixed(2), qrUrl, pdfUrl, require('crypto').createHash('sha256').update(certNumber).digest('hex')]
        );

        // Async notifications
        notifyCertificateReady(exam.mobile, exam.email, exam.user_name, certNumber, pdfUrl).catch(console.warn);
      } catch (certErr) {
        console.error('[Exams] certificate generation error:', certErr);
      }
    }

    // Send result notification
    notifyExamResult(exam.mobile, exam.email, exam.user_name, exam.trade_name, result, score, total, certNumber).catch(console.warn);

    return res.json({
      success: true,
      result: {
        examId: id,
        result,
        score,
        totalQuestions: total,
        percentage: parseFloat(percentage.toFixed(2)),
        passingMarks: exam.passing_marks,
        grade,
        passed: isPassed,
        certNumber,
        certPdfUrl,
      },
    });
  } catch (err) {
    console.error('[Exams] submit error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit exam.' });
  }
});

/**
 * GET /api/exams/:id/result
 * Get exam result after submission
 */
router.get('/:id/result', ...requireCandidate, async (req, res) => {
  const { id } = req.params;
  try {
    const examResult = await db.query(
      `SELECT e.*, c.user_id, t.name as trade_name, t.passing_marks,
              cert.cert_number, cert.pdf_url, cert.grade
       FROM exams e 
       JOIN candidates c ON e.candidate_id = c.id
       JOIN trades t ON e.trade_id = t.id
       LEFT JOIN certificates cert ON cert.exam_id = e.id
       WHERE e.id = $1`,
      [id]
    );

    if (!examResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    const exam = examResult.rows[0];
    if (exam.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (exam.result === 'ongoing') {
      return res.status(400).json({ success: false, message: 'Exam not yet submitted.' });
    }

    const percentage = exam.score && exam.total_questions
      ? parseFloat(((exam.score / exam.total_questions) * 100).toFixed(2))
      : 0;

    return res.json({
      success: true,
      result: {
        examId: id,
        tradeName: exam.trade_name,
        result: exam.result,
        score: exam.score,
        totalQuestions: exam.total_questions,
        percentage,
        passingMarks: exam.passing_marks,
        grade: exam.grade,
        passed: exam.result === 'pass',
        certNumber: exam.cert_number,
        certPdfUrl: exam.pdf_url,
        submittedAt: exam.end_time,
      },
    });
  } catch (err) {
    console.error('[Exams] result error:', err);
    return res.status(500).json({ success: false, message: 'Failed to get result.' });
  }
});

/**
 * POST /api/exams/:id/tab-switch
 * Log a tab switch event (anti-cheat)
 */
router.post('/:id/tab-switch', ...requireCandidate, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `UPDATE exams e
       SET tab_switches = e.tab_switches + 1
       FROM candidates c
       WHERE e.id = $1
         AND e.candidate_id = c.id
         AND (c.user_id = $2 OR $3 = true)
       RETURNING e.tab_switches, e.result`,
      [id, req.user.id, req.user.role === 'admin']
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false });
    }

    const { tab_switches, result: examResult } = result.rows[0];

    // Auto-submit after TAB_SWITCH_LIMIT violations
    if (tab_switches >= TAB_SWITCH_LIMIT && examResult === 'ongoing') {
      // Trigger auto-submit (reuse submit logic via internal call)
      const exam = await db.query('SELECT * FROM exams WHERE id = $1', [id]);
      if (exam.rows[0]) {
        await db.query(
          `UPDATE exams SET result = 'abandoned', end_time = NOW() WHERE id = $1 AND result = 'ongoing'`,
          [id]
        );
        return res.json({ success: true, tabSwitches: tab_switches, autoSubmitted: true, message: 'Exam auto-submitted due to too many tab switches.' });
      }
    }

    return res.json({
      success: true,
      tabSwitches: tab_switches,
      warning: tab_switches < TAB_SWITCH_LIMIT
        ? `Warning ${tab_switches}/${TAB_SWITCH_LIMIT}: Do not switch tabs during exam!`
        : null,
    });
  } catch (err) {
    console.error('[Exams] tab-switch error:', err);
    return res.status(500).json({ success: false });
  }
});

module.exports = router;
