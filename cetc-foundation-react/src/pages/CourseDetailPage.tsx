import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Star, Tag, Calendar, Book, Clock, Laptop, Wallet, CheckCircle, FileText, Camera, GraduationCap, Zap, X } from 'lucide-react';
import { getCourseBySlug, SECTORS } from '../data/courses';
import api, { initiatePayment, getUser, setToken, setUser } from '../services/api';
import SyllabusBookViewer from '../components/SyllabusBookViewer';

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const course = slug ? getCourseBySlug(slug) : undefined;

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  const sectorMeta = SECTORS.find(s => s.name === course.sector);
  const color = sectorMeta?.color || '#0D1B3E';
  const durationMonths = parseInt(course.duration) || 3;
  const totalHours = durationMonths * 60;

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Auth Modal State
  const [showAuth, setShowAuth] = useState(false);
  const [authStep, setAuthStep] = useState<'mobile' | 'otp' | 'profile'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [pendingPathway, setPendingPathway] = useState<'video' | 'rpl' | null>(null);
  const [devOtp, setDevOtp] = useState('');

  const handleAction = (pathway: 'video' | 'rpl') => {
    const user = getUser() as any;
    if (!user) {
      setPendingPathway(pathway);
      setShowAuth(true);
      setAuthStep('mobile');
      return;
    }
    if (!user.name || !user.photo_url) {
      setPendingPathway(pathway);
      setAuthStep('profile');
      setShowAuth(true);
      return;
    }
    startCheckout(user, pathway);
  };

  const startCheckout = async (user: any, pathway: string) => {
    setLoading(true);
    setError('');
    try {
      // Mock trade ID for frontend-only data
      const tradeId = (course as any).id || 1; 
      await initiatePayment(
        tradeId,
        user.name || 'Student',
        user.mobile,
        pathway,
        () => {
          setLoading(false);
          alert(`Payment Successful! Enrolled in ${pathway} pathway.`);
          navigate('/dashboard');
        },
        (err) => {
          setLoading(false);
          setError(err);
        }
      );
    } catch (err) {
      setLoading(false);
      setError('An error occurred starting checkout.');
    }
  };

  const handleSendOtp = async () => {
    if (mobile.length !== 10) return setError('Please enter a valid 10-digit mobile number');
    setLoading(true);
    setError('');
    setDevOtp('');
    
    try {
      const res = await api.auth.sendOtp(mobile);
      if (res.success) {
        setAuthStep('otp');
        // In dev mode, show the OTP for testing
        if (res.devOtp) {
          setDevOtp(res.devOtp as string);
        }
      } else {
        setError(res.message || 'Failed to send OTP. Please try again.');
      }
    } catch (e) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return setError('Please enter the 6-digit OTP');
    setLoading(true);
    setError('');
    
    try {
      const res = await api.auth.verifyOtp(mobile, otp);
      if (res.success && res.token && res.user) {
        setToken(res.token as string);
        setUser(res.user as Record<string, unknown>);
        
        const user = res.user as any;
        if (!user.profileComplete) {
          setAuthStep('profile');
        } else {
          setShowAuth(false);
          if (pendingPathway) {
            startCheckout(user, pendingPathway);
          }
        }
      } else {
        setError(res.message || 'Invalid OTP. Please try again.');
      }
    } catch (e) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !photo) return setError('Please provide name and passport photo');
    setLoading(true);
    setError('');
    try {
      const { candidateApi } = await import('../services/api');
      const photoRes = await candidateApi.uploadPhoto(photo);
      if (!photoRes.success) throw new Error(photoRes.message || 'Photo upload failed');
      
      const profRes = await candidateApi.updateProfile({ name });
      if (!profRes.success) throw new Error(profRes.message || 'Profile update failed');

      const updatedUser = { ...getUser(), name, photo_url: photoRes.photoUrl, profileComplete: true };
      setUser(updatedUser);
      
      setShowAuth(false);
      if (pendingPathway) {
        startCheckout(updatedUser, pendingPathway);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="page-hero" style={{ paddingBottom: '48px' }} id="course-detail-hero">
        <div className="wrap">
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <Link to="/courses" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>← Back to Courses</Link>
          </div>
          <div className="hero-eyebrow" style={{ background: `${color}25`, borderColor: `${color}50`, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Star size={14} /> CETCF Certified Program
          </div>
          <h1 style={{ marginBottom: '16px' }}>
            {course.name}
          </h1>
          <p className="page-hero-sub" style={{ marginBottom: '20px' }}>
            A comprehensive {course.duration.toLowerCase()} certification program in the {course.sector} sector.
            Designed for both beginners and working professionals seeking formal certification.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span className="course-meta-tag" style={{ background: `${color}20`, color, border: `1px solid ${color}40`, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={14} /> Sector: {course.sector}
            </span>
            <span className="course-meta-tag" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} /> Duration: {course.duration}
            </span>
          </div>
        </div>
      </section>
      <div className="gold-rule"></div>

      <section className="section" id="course-detail-content">
        <div className="wrap">
          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '48px' }}>
            {[
              { icon: <Calendar size={24} />, val: course.duration, key: 'Duration' },
              { icon: <Book size={24} />, val: '6 Units', key: 'Modules' },
              { icon: <Clock size={24} />, val: `${totalHours} Hrs`, key: 'Total Hours' },
              { icon: <Laptop size={24} />, val: 'Online', key: 'Exam Mode' },
              { icon: <Wallet size={24} />, val: `₹${course.fee.toLocaleString('en-IN')}`, key: 'Exam Fee' },
              { icon: <CheckCircle size={24} />, val: '35%', key: 'Pass Mark' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: 'var(--cetc-gold)' }}>{s.icon}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>{s.val}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>{s.key}</div>
              </div>
            ))}
          </div>

          {/* Syllabus Book Viewer */}
          <div style={{ marginBottom: '48px' }}>
            <span className="sec-eyebrow">Complete Curriculum</span>
            <h2 className="sec-title">Course Syllabus Book</h2>
            <p className="sec-subtitle" style={{ marginBottom: '24px' }}>
              Swipe or click next to read the complete detailed syllabus for this certification.
            </p>
            <SyllabusBookViewer courseSlug={course.slug} />
          </div>

          {/* Assessment Structure */}
          <div style={{ marginBottom: '48px' }}>
            <span className="sec-eyebrow">Assessment & Marking</span>
            <h2 className="sec-title">Exam Structure</h2>
            <p className="sec-subtitle">
              The exam is fully automated. All components are completed online via the CETCF portal.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '28px' }}>
              <div className="card" style={{ padding: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #1A2B7A, #4A6BCA)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: '#1A2B7A' }}><FileText size={32} /></div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>Theory — MCQ</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#1A2B7A', marginBottom: '4px' }}>50 Marks</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>
                  25 multiple-choice questions × 2 marks each. 45-minute timer. Auto-scored instantly.
                </div>
              </div>
              <div className="card" style={{ padding: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--success), #4ABCA0)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: 'var(--success)' }}><Camera size={32} /></div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>Practical — Portfolio Upload</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)', marginBottom: '4px' }}>50 Marks</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>
                  Upload evidence items — photos/videos demonstrating your skills. Auto-scored on completion.
                </div>
              </div>
            </div>
          </div>

          {/* Eligibility & Outcomes */}
          <div style={{ marginBottom: '48px' }}>
            <span className="sec-eyebrow">Who Can Enrol & What You'll Achieve</span>
            <h2 className="sec-title">Eligibility & Learning Outcomes</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '28px' }}>
              <div className="card" style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px', paddingBottom: '10px', borderBottom: `2px solid ${color}`, display: 'inline-block' }}>
                  Eligibility Criteria
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    'Minimum age: 14 years',
                    'Minimum education: Class 8th pass',
                    'No prior experience needed — beginners welcome',
                    'Already working? Apply for direct RPL exam',
                    'Valid ID proof required at registration',
                    'Applicable for male & female candidates',
                  ].map((item, i) => (
                    <li key={i} style={{ fontSize: '13px', display: 'flex', gap: '10px', alignItems: 'flex-start', lineHeight: 1.5 }}>
                      <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: color, color: '#fff', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card" style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px', paddingBottom: '10px', borderBottom: '2px solid var(--gold)', display: 'inline-block' }}>
                  Learning Outcomes
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    `Understand core concepts of ${course.name}`,
                    'Apply practical skills in real-world scenarios',
                    'Follow industry safety and hygiene standards',
                    'Demonstrate professional competency through assessment',
                    'Build a professional portfolio or work samples',
                    'Gain confidence for employment or self-employment',
                  ].map((item, i) => (
                    <li key={i} style={{ fontSize: '13px', display: 'flex', gap: '10px', alignItems: 'flex-start', lineHeight: 1.5 }}>
                      <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--gold)', color: '#fff', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Certificate Preview */}
          <div style={{ marginBottom: '48px' }}>
            <span className="sec-eyebrow">Certification</span>
            <h2 className="sec-title">Certificate You Will Receive</h2>
            <p className="sec-subtitle">
              On passing all exam components, your CETCF certificate is issued with a unique Certificate ID and QR verification code.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '28px' }}>
              <img 
                src={`/certificates/${course.name.replace(/[\\/*?:"<>|]/g, '')}.png`} 
                alt={`${course.name} Certificate`}
                style={{
                  maxWidth: '700px',
                  width: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
                loading="lazy"
              />
            </div>
          </div>

          {/* CTA Banner */}
          <div style={{
            background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)',
            borderRadius: '16px',
            padding: '36px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
          }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: '#fff', marginBottom: '8px' }}>
                Ready to Get Certified in {course.name}?
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: '420px' }}>
                Start your journey today. Take the online exam from home and receive your government-recognized certificate.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => handleAction('video')}
                className="btn btn-gold" 
                disabled={loading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <GraduationCap size={18} /> Buy Video Course — ₹{(course.fee + 500).toLocaleString('en-IN')}
              </button>
              <button 
                onClick={() => handleAction('rpl')}
                className="btn btn-outline" 
                disabled={loading}
                style={{ background: 'rgba(255,255,255,0.1)', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
              >
                <Zap size={18} /> Take Exam Now — ₹{course.fee.toLocaleString('en-IN')}
              </button>
              {error && <div style={{ width: '100%', color: '#ff6b6b', fontSize: '14px', marginTop: '8px' }}>{error}</div>}
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal overlay */}
      {showAuth && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ padding: '32px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button 
              onClick={() => setShowAuth(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
            ><X size={20} /></button>
            <h3 style={{ marginBottom: '16px', color: '#fff' }}>Login / Register</h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
              Please enter your mobile number to continue with purchase.
            </p>
            
            {authStep === 'mobile' && (
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="10-digit number"
                  value={mobile}
                  onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
                <button 
                  className="btn btn-gold" 
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={handleSendOtp}
                  disabled={loading || mobile.length !== 10}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            )}

            {authStep === 'otp' && (
              <div className="form-group">
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
                  OTP sent to <strong style={{ color: '#fff' }}>+91 {mobile}</strong>
                  <button 
                    onClick={() => { setAuthStep('mobile'); setOtp(''); setError(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '13px', marginLeft: '8px' }}
                  >Change</button>
                </p>
                {devOtp && (
                  <div style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px', color: 'var(--gold)' }}>
                    🔧 Dev Mode — OTP: <strong>{devOtp}</strong>
                  </div>
                )}
                <label className="form-label">Enter OTP</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ letterSpacing: '8px', fontSize: '20px', textAlign: 'center', fontWeight: 'bold' }}
                />
                <button 
                  className="btn btn-gold" 
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button 
                  onClick={handleSendOtp}
                  disabled={loading}
                  style={{ width: '100%', marginTop: '8px', background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--muted)', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
                >
                  Resend OTP
                </button>
              </div>
            )}

            {authStep === 'profile' && (
              <div className="form-group">
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>Please complete your profile to receive your certificate.</p>
                
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="As per Aadhaar/Govt ID"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ marginBottom: '16px' }}
                />
                
                <label className="form-label">Passport Size Photo</label>
                <div style={{ border: '1px dashed rgba(255,255,255,0.2)', padding: '16px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', marginBottom: '16px' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setPhoto(e.target.files?.[0] || null)}
                    style={{ fontSize: '12px', color: '#fff', width: '100%' }}
                  />
                  {photo && <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '8px' }}>Selected: {photo.name}</div>}
                </div>

                <button 
                  className="btn btn-gold" 
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={handleSaveProfile}
                  disabled={loading || !name.trim() || !photo}
                >
                  {loading ? 'Saving...' : 'Save & Proceed to Payment'}
                </button>
              </div>
            )}
            
            {error && <div style={{ color: '#ff6b6b', fontSize: '14px', marginTop: '16px', textAlign: 'center' }}>{error}</div>}
          </div>
        </div>
      )}
    </>
  );
}
