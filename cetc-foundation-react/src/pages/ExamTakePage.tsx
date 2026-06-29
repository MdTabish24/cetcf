import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, Clock, ArrowLeft, ArrowRight, PartyPopper, Frown, CheckCircle, XCircle, Shield, BookOpen } from 'lucide-react';
import { getCourseBySlug } from '../data/courses';

interface MCQQuestion {
  qno: number;
  module: number;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: string;
  difficulty: string;
  explanation: string;
}

interface MCQData {
  course_name: string;
  sector: string;
  level: string;
  duration: string;
  total_marks: number;
  pass_percentage: number;
  exam_duration_minutes: number;
  modules: Array<{ module_number: number; module_title: string; question_range: string }>;
  questions: MCQQuestion[];
}

interface ExamResult {
  slug: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  timestamp: number;
  answers: Record<number, string>;
}

const PASS_PERCENTAGE = 35;
const RETRY_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
const TAB_SWITCH_LIMIT = 3;

function getExamHistory(slug: string): ExamResult | null {
  try {
    const raw = localStorage.getItem(`cetcf_exam_${slug}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveExamResult(result: ExamResult) {
  localStorage.setItem(`cetcf_exam_${result.slug}`, JSON.stringify(result));
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function ExamTakePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const course = slug ? getCourseBySlug(slug) : undefined;

  const [step, setStep] = useState<'loading' | 'blocked' | 'info' | 'exam' | 'result'>('loading');
  const [mcqData, setMcqData] = useState<MCQData | null>(null);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [timeRemainingMs, setTimeRemainingMs] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState('');
  const [blockMessage, setBlockMessage] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const examStartedRef = useRef(false);

  // Load MCQ data
  useEffect(() => {
    if (!slug) { navigate('/courses'); return; }
    
    // Check for retry cooldown
    const history = getExamHistory(slug);
    if (history && !history.passed) {
      const elapsed = Date.now() - history.timestamp;
      if (elapsed < RETRY_COOLDOWN_MS) {
        const hoursLeft = Math.ceil((RETRY_COOLDOWN_MS - elapsed) / (60 * 60 * 1000));
        setBlockMessage(`Aapne pichli baar yeh exam fail kiya tha. Please ${hoursLeft} ghante baad dubara try karein.`);
        setResult(history);
        setStep('blocked');
        return;
      }
    }

    fetch(`/mcqs/${slug}.json`)
      .then(res => {
        if (!res.ok) throw new Error('MCQ file not found');
        return res.json();
      })
      .then((data: MCQData) => {
        setMcqData(data);
        setStep('info');
      })
      .catch(() => {
        setError('Exam questions not available for this course.');
        setStep('loading');
      });
  }, [slug, navigate]);

  // Tab switch detection
  useEffect(() => {
    if (step !== 'exam') return;

    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const newCount = prev + 1;
          if (newCount >= TAB_SWITCH_LIMIT) {
            alert('⚠️ Tab switch limit exceeded! Your exam has been auto-submitted.');
            handleSubmit();
          } else {
            alert(`⚠️ Warning: Tab switch detected! (${newCount}/${TAB_SWITCH_LIMIT}). ${TAB_SWITCH_LIMIT - newCount} more switches will auto-submit your exam.`);
          }
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [step]);

  // Timer
  useEffect(() => {
    if (step === 'exam' && timeRemainingMs > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemainingMs(prev => {
          if (prev <= 1000) {
            if (timerRef.current) clearInterval(timerRef.current);
            // Auto-submit on timer expiry
            setTimeout(() => handleSubmit(), 0);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, examStartedRef.current]);

  const startExam = () => {
    if (!mcqData) return;
    const shuffled = shuffleArray(mcqData.questions);
    setQuestions(shuffled);
    setAnswers({});
    setCurrentQIdx(0);
    setTabSwitches(0);
    setTimeRemainingMs((mcqData.exam_duration_minutes || 60) * 60 * 1000);
    examStartedRef.current = true;
    setStep('exam');
  };

  const handleSubmit = useCallback(() => {
    if (!slug || !mcqData) return;
    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate score
    let correct = 0;
    const allQuestions = questions.length > 0 ? questions : mcqData.questions;
    
    for (const q of allQuestions) {
      if (answers[q.qno] === q.correct) {
        correct++;
      }
    }

    const total = allQuestions.length;
    const percentage = Math.round((correct / total) * 100);
    const passed = percentage >= PASS_PERCENTAGE;

    const examResult: ExamResult = {
      slug,
      score: correct,
      total,
      percentage,
      passed,
      timestamp: Date.now(),
      answers,
    };

    saveExamResult(examResult);
    setResult(examResult);
    setStep('result');
  }, [slug, mcqData, questions, answers]);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const courseName = course?.name || mcqData?.course_name || slug || 'Exam';

  // BLOCKED state
  if (step === 'blocked') {
    return (
      <section className="section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
        <div className="wrap" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div className="card" style={{ padding: '48px 32px' }}>
            <Shield size={64} color="var(--danger)" style={{ marginBottom: '20px' }} />
            <h2 style={{ color: '#fff', marginBottom: '16px', fontSize: '24px' }}>Exam Locked — Retry Tomorrow</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '15px', lineHeight: 1.7 }}>
              {blockMessage}
            </p>
            {result && (
              <div style={{ background: 'rgba(198,40,40,0.08)', border: '1px solid rgba(198,40,40,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <p style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '18px' }}>
                  Last Score: {result.score}/{result.total} ({result.percentage}%)
                </p>
                <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
                  Pass mark: {PASS_PERCENTAGE}% | Required: {Math.ceil(result.total * PASS_PERCENTAGE / 100)} correct answers
                </p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to={`/courses/${slug}`} className="btn btn-outline">← Back to Course</Link>
              <Link to="/courses" className="btn btn-gold">Browse All Courses</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // LOADING state
  if (step === 'loading') {
    return (
      <section className="section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          {error ? (
            <div className="card" style={{ padding: '48px', maxWidth: '500px', margin: '0 auto' }}>
              <AlertTriangle size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: '#fff', marginBottom: '12px' }}>{error}</h3>
              <Link to="/courses" className="btn btn-gold" style={{ marginTop: '16px' }}>Browse Courses</Link>
            </div>
          ) : (
            <div style={{ color: 'var(--muted)', fontSize: '18px' }}>Loading exam...</div>
          )}
        </div>
      </section>
    );
  }

  // INFO step — exam rules
  if (step === 'info' && mcqData) {
    return (
      <>
        <section className="page-hero" style={{ paddingBottom: '32px' }}>
          <div className="wrap">
            <Link to={`/courses/${slug}`} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', display: 'inline-block', marginBottom: '12px' }}>← Back to Course</Link>
            <div className="hero-eyebrow" style={{ background: 'rgba(212,175,55,0.15)', borderColor: 'rgba(212,175,55,0.3)' }}>
              <BookOpen size={14} /> CETCF Online Examination
            </div>
            <h1 style={{ marginBottom: '8px' }}>{courseName}</h1>
            <p className="page-hero-sub">Online MCQ Examination — Answer all questions within the time limit</p>
          </div>
        </section>
        <div className="gold-rule"></div>

        <section className="section">
          <div className="wrap" style={{ maxWidth: '700px' }}>
            {/* Exam Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '32px' }}>
              {[
                { icon: '📝', val: `${mcqData.questions.length}`, label: 'Questions' },
                { icon: '⏱️', val: `${mcqData.exam_duration_minutes || 60} min`, label: 'Duration' },
                { icon: '✅', val: `${PASS_PERCENTAGE}%`, label: 'Pass Mark' },
                { icon: '💯', val: `${mcqData.total_marks || 100}`, label: 'Total Marks' },
              ].map((s, i) => (
                <div key={i} className="card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', marginBottom: '6px' }}>{s.icon}</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--gold)' }}>{s.val}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Exam Rules */}
            <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--danger)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} /> Exam Rules — Please Read Carefully
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Exam ek baar start hone ke baad pause ya restart nahi ho sakta.',
                  'Tab switch karna track hota hai. 3 baar tab switch = auto-submit (fail).',
                  `Pass hone ke liye ${PASS_PERCENTAGE}% marks chahiye (${Math.ceil(mcqData.questions.length * PASS_PERCENTAGE / 100)} correct out of ${mcqData.questions.length}).`,
                  'Fail hone par 24 ghante baad hi dobara exam de sakte hain.',
                  'Questions Hinglish mein hain — Hindi + English mix.',
                  'Stable internet connection ensure karein.',
                  'Koi external help ya reference material allowed nahi hai.',
                ].map((rule, i) => (
                  <li key={i} style={{ fontSize: '14px', color: 'var(--text-main)', display: 'flex', gap: '10px', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--danger)', flexShrink: 0, fontWeight: 700 }}>•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Modules covered */}
            <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>📚 Modules Covered in Exam</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {mcqData.modules.map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gold)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>{m.module_number}</span>
                    <div>
                      <div style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>{m.module_title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{m.question_range}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              className="btn btn-gold btn-lg"
              onClick={startExam}
              style={{ width: '100%', padding: '18px', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              🚀 Start Exam Now
            </button>
          </div>
        </section>
      </>
    );
  }

  // EXAM step
  if (step === 'exam' && questions.length > 0) {
    const q = questions[currentQIdx];
    const answeredCount = Object.keys(answers).length;
    const isUrgent = timeRemainingMs < 300000; // < 5 min

    return (
      <section className="section" style={{ minHeight: '100vh', padding: '12px 0' }}>
        <div className="wrap-lg">
          {/* Top Bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(255,255,255,0.05)', padding: '14px 20px', borderRadius: '12px',
            marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
            position: 'sticky', top: '0', zIndex: 100, backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{courseName}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{answeredCount}/{questions.length} answered</div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{
                color: isUrgent ? '#ff6b6b' : 'var(--gold)',
                fontSize: '22px', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '6px',
                animation: isUrgent ? 'pulse 1s infinite' : 'none'
              }}>
                <Clock size={20} /> {formatTime(timeRemainingMs)}
              </div>
              <button
                className="btn btn-gold"
                onClick={() => {
                  if (window.confirm(`Kya aap exam submit karna chahte hain? ${answeredCount}/${questions.length} questions answered hain.`)) {
                    handleSubmit();
                  }
                }}
                style={{ fontWeight: 700 }}
              >
                Submit Exam
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(280px, 320px)', gap: '20px', alignItems: 'start' }}>
            {/* Question Area */}
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: 700 }}>
                  Question {currentQIdx + 1} / {questions.length}
                </span>
                <span style={{
                  fontSize: '11px', padding: '4px 10px', borderRadius: '20px',
                  background: q.difficulty === 'hard' ? 'rgba(198,40,40,0.15)' : q.difficulty === 'medium' ? 'rgba(255,152,0,0.15)' : 'rgba(76,175,80,0.15)',
                  color: q.difficulty === 'hard' ? '#ef5350' : q.difficulty === 'medium' ? '#ff9800' : '#4caf50',
                  fontWeight: 600, textTransform: 'capitalize'
                }}>
                  {q.difficulty}
                </span>
              </div>

              <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '24px', lineHeight: 1.6, fontWeight: 500 }}>
                {q.question}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(['A', 'B', 'C', 'D'] as const).map(opt => {
                  const isSelected = answers[q.qno] === opt;
                  return (
                    <label
                      key={opt}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '14px 18px',
                        border: `1.5px solid ${isSelected ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '10px', cursor: 'pointer',
                        background: isSelected ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget.style.background = 'rgba(255,255,255,0.05)'); }}
                      onMouseLeave={e => { if (!isSelected) (e.currentTarget.style.background = 'rgba(255,255,255,0.02)'); }}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        border: `2px solid ${isSelected ? 'var(--gold)' : 'rgba(255,255,255,0.2)'}`,
                        background: isSelected ? 'var(--gold)' : 'transparent',
                        color: isSelected ? '#000' : 'rgba(255,255,255,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '14px', flexShrink: 0,
                        transition: 'all 0.2s ease'
                      }}>
                        {opt}
                      </div>
                      <input
                        type="radio"
                        name={`q-${q.qno}`}
                        value={opt}
                        checked={isSelected}
                        onChange={() => setAnswers(prev => ({ ...prev, [q.qno]: opt }))}
                        style={{ display: 'none' }}
                      />
                      <span style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.5 }}>
                        {q.options[opt]}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setCurrentQIdx(p => Math.max(0, p - 1))}
                  disabled={currentQIdx === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ArrowLeft size={16} /> Previous
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setCurrentQIdx(p => Math.min(questions.length - 1, p + 1))}
                  disabled={currentQIdx === questions.length - 1}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Question Navigator */}
            <div className="card" style={{ padding: '20px', position: 'sticky', top: '80px' }}>
              <h4 style={{ color: '#fff', marginBottom: '14px', fontSize: '14px', fontWeight: 700 }}>Question Navigator</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {questions.map((qItem, idx) => {
                  const isAnswered = !!answers[qItem.qno];
                  const isCurrent = idx === currentQIdx;
                  return (
                    <button
                      key={qItem.qno}
                      onClick={() => setCurrentQIdx(idx)}
                      style={{
                        aspectRatio: '1/1', borderRadius: '6px',
                        border: isCurrent ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
                        background: isAnswered ? 'var(--gold)' : 'rgba(255,255,255,0.04)',
                        color: isAnswered ? '#000' : 'rgba(255,255,255,0.5)',
                        fontWeight: 700, cursor: 'pointer', fontSize: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: 'var(--muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', background: 'var(--gold)', borderRadius: '2px' }}></div> Answered ({answeredCount})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2px' }}></div> Unanswered ({questions.length - answeredCount})
                </div>
              </div>
              {tabSwitches > 0 && (
                <div style={{ marginTop: '16px', padding: '10px', background: 'rgba(198,40,40,0.1)', borderRadius: '8px', border: '1px solid rgba(198,40,40,0.2)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: 700 }}>
                    ⚠ Tab Switches: {tabSwitches}/{TAB_SWITCH_LIMIT}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // RESULT step
  if (step === 'result' && result) {
    return (
      <section className="section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
        <div className="wrap" style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '48px 36px', textAlign: 'center' }}>
            {/* Icon */}
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
              {result.passed
                ? <PartyPopper size={72} color="var(--success)" />
                : <Frown size={72} color="var(--danger)" />}
            </div>

            {/* Title */}
            <h2 style={{ color: '#fff', fontSize: '28px', marginBottom: '8px' }}>
              {result.passed ? '🎉 Congratulations! You Passed!' : '😔 Exam Not Passed'}
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '16px', marginBottom: '32px' }}>
              {courseName}
            </p>

            {/* Score Card */}
            <div style={{
              background: result.passed ? 'rgba(76,175,80,0.08)' : 'rgba(198,40,40,0.08)',
              border: `1px solid ${result.passed ? 'rgba(76,175,80,0.2)' : 'rgba(198,40,40,0.2)'}`,
              borderRadius: '16px', padding: '28px', marginBottom: '32px'
            }}>
              <div style={{ fontSize: '48px', fontWeight: 800, color: result.passed ? 'var(--success)' : 'var(--danger)', marginBottom: '8px' }}>
                {result.percentage}%
              </div>
              <div style={{ fontSize: '16px', color: 'var(--muted)', marginBottom: '16px' }}>
                {result.score} correct out of {result.total} questions
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Pass Mark</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{PASS_PERCENTAGE}%</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Your Score</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: result.passed ? 'var(--success)' : 'var(--danger)' }}>{result.percentage}%</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Result</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: result.passed ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {result.passed ? <><CheckCircle size={18} /> PASS</> : <><XCircle size={18} /> FAIL</>}
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            {result.passed ? (
              <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
                <h4 style={{ color: 'var(--gold)', marginBottom: '8px', fontSize: '16px' }}>🏆 Certificate Eligible</h4>
                <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>
                  Aapne exam pass kar liya hai! Certificate ke liye payment complete karein ya admin se contact karein.
                </p>
              </div>
            ) : (
              <div style={{ background: 'rgba(198,40,40,0.08)', border: '1px solid rgba(198,40,40,0.2)', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
                <h4 style={{ color: 'var(--danger)', marginBottom: '8px', fontSize: '16px' }}>📚 More Preparation Needed</h4>
                <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>
                  Aap 24 ghante baad dubara exam de sakte hain. Course syllabus padh kar achhi taiyari karein.
                </p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to={`/courses/${slug}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={16} /> Back to Course
              </Link>
              <Link to="/courses" className="btn btn-gold">Browse All Courses</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
