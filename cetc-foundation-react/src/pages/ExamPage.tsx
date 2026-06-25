import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api, { getUser } from '../services/api';
import { COURSES } from '../data/courses';

export default function ExamPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tradeIdParam = searchParams.get('trade_id');
  
  const [step, setStep] = useState<'select' | 'info' | 'exam' | 'result'>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data states
  const [examId, setExamId] = useState<number | null>(null);
  const [examData, setExamData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [timeRemainingMs, setTimeRemainingMs] = useState<number>(0);
  const [resultData, setResultData] = useState<any>(null);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      alert('Please login to access the exam portal.');
      navigate('/');
      return;
    }
    
    if (tradeIdParam) {
      setStep('info');
    }
  }, [tradeIdParam, navigate]);

  // Anti-cheat & Timer refs
  const timerInterval = useRef<any>(null);
  const saveInterval = useRef<any>(null);

  // Focus tracking
  useEffect(() => {
    if (step !== 'exam' || !examId) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        try {
          const res = await api.exams.reportTabSwitch(examId);
          if (res.autoSubmitted) {
            alert(res.message);
            fetchResult(examId);
          } else if (res.warning) {
            alert(res.warning);
          }
        } catch (e) {
          console.error('Tab switch report failed', e);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [step, examId]);

  // Timer logic
  useEffect(() => {
    if (step === 'exam' && timeRemainingMs > 0) {
      timerInterval.current = setInterval(() => {
        setTimeRemainingMs(prev => {
          if (prev <= 1000) {
            clearInterval(timerInterval.current);
            handleSubmitExam();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      saveInterval.current = setInterval(() => {
        if (examId) api.exams.saveAnswers(examId, answers).catch(console.warn);
      }, 30000); // 30 sec
    }

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (saveInterval.current) clearInterval(saveInterval.current);
    };
  }, [step, timeRemainingMs, examId, answers]);


  const startExam = async () => {
    if (!tradeIdParam) return;
    setLoading(true);
    setError('');
    try {
      const startRes = await api.exams.start(parseInt(tradeIdParam));
      if (!startRes.success) {
        setError(startRes.message || 'Failed to start exam.');
        setLoading(false);
        return;
      }
      
      const exId = startRes.examId as number;
      setExamId(exId);
      
      const getRes: any = await api.exams.getExam(exId);
      if (getRes.success) {
        setExamData(getRes.exam);
        setQuestions(getRes.questions || []);
        setAnswers(getRes.exam.savedAnswers || {});
        setTimeRemainingMs(getRes.exam.timeRemainingMs);
        setStep('exam');
      } else {
        setError(getRes.message || 'Failed to load questions.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExam = async () => {
    if (!examId) return;
    setLoading(true);
    try {
      const res = await api.exams.submit(examId, answers);
      if (res.success) {
        setResultData(res.result);
        setStep('result');
      } else {
        alert(res.message || 'Failed to submit exam');
      }
    } catch (e) {
      alert('Error submitting exam.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResult = async (exId: number) => {
    setLoading(true);
    try {
      const res = await api.exams.getResult(exId);
      if (res.success) {
        setResultData(res.result);
        setStep('result');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (qId: number, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentCourse = COURSES.find(c => c.sno === parseInt(tradeIdParam || '0'));

  if (step === 'select') {
    return (
      <section className="section" style={{ minHeight: '60vh', textAlign: 'center', paddingTop: '100px' }}>
        <div className="wrap">
          <h2>Exam Portal</h2>
          <p>Please select an exam from your Dashboard.</p>
          <button className="btn btn-gold" onClick={() => navigate('/dashboard')} style={{ marginTop: '20px' }}>Go to Dashboard</button>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ minHeight: '80vh', padding: '20px 0' }}>
      <div className="wrap-lg">
        
        {step === 'info' && (
          <div className="card" style={{ maxWidth: '600px', margin: '40px auto', padding: '32px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '16px', color: '#fff', fontSize: '24px' }}>Start Exam: {currentCourse?.name || 'Certification'}</h2>
            
            <div style={{ background: 'rgba(198,40,40,0.04)', border: '1px solid rgba(198,40,40,0.15)', borderRadius: '12px', padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--danger)', marginBottom: '12px' }}>⚠️ EXAM RULES</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  'Once started, the exam cannot be paused or restarted.',
                  'Switching tabs will be tracked and counted.',
                  'Switching tabs more than 3 times will auto-submit your exam resulting in a fail.',
                  'Ensure a stable internet connection before starting.',
                  'No external help or reference material allowed.',
                ].map((rule, i) => (
                  <li key={i} style={{ fontSize: '13px', color: 'var(--text)', display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--danger)', flexShrink: 0 }}>•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {error && <div style={{ color: '#ff6b6b', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
            
            <button 
              className="btn btn-gold btn-lg" 
              onClick={startExam} 
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Starting Exam...' : 'Start Exam Now'}
            </button>
          </div>
        )}

        {step === 'exam' && examData && questions.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                {examData.tradeName}
              </div>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ color: timeRemainingMs < 300000 ? '#ff6b6b' : 'var(--gold)', fontSize: '20px', fontWeight: 'bold' }}>
                  ⏱️ {formatTime(timeRemainingMs)}
                </div>
                <button className="btn btn-primary" onClick={handleSubmitExam} disabled={loading}>
                  Submit Exam
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px, 350px)', gap: '24px', alignItems: 'start' }}>
              {/* Question Area */}
              <div className="card" style={{ padding: '32px' }}>
                <div style={{ fontSize: '14px', color: 'var(--gold)', marginBottom: '12px', fontWeight: 'bold' }}>
                  Question {currentQIdx + 1} of {questions.length}
                </div>
                <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '24px', lineHeight: 1.5 }}>
                  {questions[currentQIdx].question_text}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['a', 'b', 'c', 'd'].map(opt => {
                    const q = questions[currentQIdx];
                    const val = q[`option_${opt}`];
                    if (!val) return null;
                    const isSelected = answers[q.id] === opt.toUpperCase();
                    
                    return (
                      <label 
                        key={opt}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '16px', border: `1px solid ${isSelected ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '8px', cursor: 'pointer',
                          background: isSelected ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                          transition: 'all 0.2s'
                        }}
                      >
                        <input 
                          type="radio" 
                          name={`q-${q.id}`} 
                          value={opt.toUpperCase()} 
                          checked={isSelected}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          style={{ accentColor: 'var(--gold)', width: '18px', height: '18px' }}
                        />
                        <span style={{ color: isSelected ? '#fff' : 'var(--muted)', fontSize: '16px' }}>{val}</span>
                      </label>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setCurrentQIdx(p => Math.max(0, p - 1))}
                    disabled={currentQIdx === 0}
                  >
                    ← Previous
                  </button>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setCurrentQIdx(p => Math.min(questions.length - 1, p + 1))}
                    disabled={currentQIdx === questions.length - 1}
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Navigation Grid */}
              <div className="card" style={{ padding: '20px' }}>
                <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '15px' }}>Question Navigator</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {questions.map((q, idx) => {
                    const isAnswered = !!answers[q.id];
                    const isCurrent = idx === currentQIdx;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQIdx(idx)}
                        style={{
                          aspectRatio: '1/1',
                          borderRadius: '6px',
                          border: isCurrent ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                          background: isAnswered ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
                          color: isAnswered ? '#000' : '#fff',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', background: 'var(--gold)', borderRadius: '2px' }}></div> Answered
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2px' }}></div> Unanswered
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'result' && resultData && (
          <div className="card" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>
              {resultData.passed ? '🎉' : '😔'}
            </div>
            <h2 style={{ color: '#fff', marginBottom: '8px', fontSize: '28px' }}>
              {resultData.passed ? 'Congratulations! You Passed.' : 'Exam Failed'}
            </h2>
            <p style={{ color: 'var(--muted)', marginBottom: '32px', fontSize: '16px' }}>
              You scored {resultData.score} out of {resultData.totalQuestions} ({resultData.percentage}%)
            </p>
            
            {resultData.passed && (
               <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--gold)', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
                  <h4 style={{ color: 'var(--gold)', marginBottom: '8px' }}>Your Certificate is Ready</h4>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
                    Certificate Number: <strong>{resultData.certNumber}</strong><br/>
                    Grade: <strong>{resultData.grade}</strong>
                  </p>
                  {resultData.certPdfUrl ? (
                    <a href={resultData.certPdfUrl} target="_blank" rel="noreferrer" className="btn btn-gold" style={{ display: 'inline-block' }}>
                      Download Certificate (PDF)
                    </a>
                  ) : (
                    <div style={{ color: 'var(--gold)', fontSize: '14px' }}>
                      Certificate PDF generating... check your dashboard shortly.
                    </div>
                  )}
               </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
