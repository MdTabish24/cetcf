import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Shield, Briefcase, ChevronRight } from 'lucide-react';
import api, { setToken, setUser } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'student' | 'partner' | 'admin'>('student');
  
  // Student Auth State
  const [authStep, setAuthStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (mobile.length !== 10) return setError('Invalid mobile number');
    setLoading(true);
    setError('');
    const res = await api.auth.sendOtp(mobile);
    setLoading(false);
    if (res.success) {
      setAuthStep('otp');
      if (res.devOtp) alert(`TEST OTP: ${res.devOtp}`);
    } else {
      setError(res.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) return setError('Invalid OTP');
    setLoading(true);
    setError('');
    const res = await api.auth.verifyOtp(mobile, otp);
    setLoading(false);
    if (res.success && res.token && res.user) {
      setToken(res.token as string);
      setUser(res.user as Record<string, unknown>);
      navigate('/dashboard');
    } else {
      setError(res.message || 'Invalid OTP');
    }
  };

  return (
    <section className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="wrap-sm">
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <button 
              onClick={() => setActiveTab('student')}
              style={{ flex: 1, padding: '16px', border: 'none', background: activeTab === 'student' ? 'rgba(212, 175, 55, 0.1)' : 'transparent', color: activeTab === 'student' ? 'var(--gold)' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: activeTab === 'student' ? 700 : 400, borderBottom: activeTab === 'student' ? '2px solid var(--gold)' : '2px solid transparent' }}
            >
              <User size={16} /> Student
            </button>
            <button 
              onClick={() => setActiveTab('partner')}
              style={{ flex: 1, padding: '16px', border: 'none', background: activeTab === 'partner' ? 'rgba(212, 175, 55, 0.1)' : 'transparent', color: activeTab === 'partner' ? 'var(--gold)' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: activeTab === 'partner' ? 700 : 400, borderBottom: activeTab === 'partner' ? '2px solid var(--gold)' : '2px solid transparent' }}
            >
              <Briefcase size={16} /> Partner
            </button>
            <button 
              onClick={() => setActiveTab('admin')}
              style={{ flex: 1, padding: '16px', border: 'none', background: activeTab === 'admin' ? 'rgba(212, 175, 55, 0.1)' : 'transparent', color: activeTab === 'admin' ? 'var(--gold)' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: activeTab === 'admin' ? 700 : 400, borderBottom: activeTab === 'admin' ? '2px solid var(--gold)' : '2px solid transparent' }}
            >
              <Shield size={16} /> Admin
            </button>
          </div>

          <div style={{ padding: '32px' }}>
            {activeTab === 'student' && (
              <div>
                <h3 style={{ marginBottom: '16px', color: '#fff' }}>Student Login</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
                  Login to access your courses, exams, and certificates.
                </p>
                
                {authStep === 'mobile' ? (
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
                      {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Enter OTP</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="4 or 6 digit OTP"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                    <button 
                      className="btn btn-gold" 
                      style={{ width: '100%', marginTop: '16px' }}
                      onClick={handleVerifyOtp}
                      disabled={loading || otp.length < 4}
                    >
                      {loading ? 'Verifying...' : 'Verify & Login'}
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                      <button onClick={() => setAuthStep('mobile')} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>Change Mobile Number</button>
                    </div>
                  </div>
                )}
                
                {error && <div style={{ color: '#ff6b6b', fontSize: '14px', marginTop: '16px', textAlign: 'center' }}>{error}</div>}
              </div>
            )}

            {activeTab === 'partner' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--cetc-gold)' }}>
                  <Briefcase size={48} />
                </div>
                <h3 style={{ marginBottom: '16px', color: '#fff' }}>AAC Partner Portal</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
                  Manage your batches, students, and commission payouts from the partner portal.
                </p>
                <Link to="/partner" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
                  Go to Partner Portal <ChevronRight size={18} />
                </Link>
              </div>
            )}

            {activeTab === 'admin' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--cetc-gold)' }}>
                  <Shield size={48} />
                </div>
                <h3 style={{ marginBottom: '16px', color: '#fff' }}>Admin Dashboard</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
                  System control panel for managing partners, candidates, and certificates.
                </p>
                <Link to="/admin" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
                  Go to Admin Login <ChevronRight size={18} />
                </Link>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </section>
  );
}
