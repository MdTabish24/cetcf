import { useState, useEffect } from 'react';
import { Wallet, Landmark, ClipboardCheck, Handshake } from 'lucide-react';
import api, { getUser, setToken, setUser, clearToken } from '../services/api';
import IndiaMap from '../components/home/IndiaMap';

export default function PartnerPage() {
  const [user, setLocalUser] = useState(getUser());
  
  // Marketing Form State
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', city: '', state: '', centerName: '', message: '',
  });

  // Login State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginView, setIsLoginView] = useState(false);

  // Dashboard State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const isPartner = user && user.role === 'partner';

  useEffect(() => {
    if (isPartner) {
      fetchData();
    }
  }, [isPartner, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setData(null);
    try {
      if (activeTab === 'dashboard') {
        const res = await api.partners.getDashboard();
        if (res.success) setData(res.data || res.dashboard);
      } else if (activeTab === 'batches') {
        const res = await api.partners.getBatches();
        if (res.success) setData(res.batches);
      } else if (activeTab === 'earnings') {
        const res = await api.partners.getEarnings();
        if (res.success) setData(res.earnings);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        contact_name: formData.name,
        mobile: formData.phone,
        email: formData.email,
        district: formData.city,
        state: formData.state,
        org_name: formData.centerName || `${formData.name}'s Center`,
        address: formData.message,
        org_type: 'Other',
        expected_monthly_students: 0
      };
      const res = await api.partners.register(payload);
      if (res.success) {
        alert('Application submitted successfully! We will contact you soon.');
        setFormData({ name: '', phone: '', email: '', city: '', state: '', centerName: '', message: '' });
      } else {
        alert(res.message || 'Application failed');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await api.auth.partnerLogin(loginPhone, loginPassword);
      if (res.success) {
        setToken(res.token as string);
        setUser(res.user as any);
        setLocalUser(res.user as any);
      } else {
        setLoginError(res.message || 'Login failed');
      }
    } catch (err) {
      setLoginError('Network error');
    }
  };

  const handleLogout = () => {
    clearToken();
    setLocalUser(null);
  };

  if (isPartner) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        {/* Sidebar */}
        <aside style={{ width: '250px', background: 'var(--navy)', color: '#fff', padding: '24px 0', position: 'relative' }}>
          <div style={{ padding: '0 24px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--gold)' }}>AAC Portal</h2>
            <p style={{ fontSize: '12px', opacity: 0.7 }}>{(user as any)?.name}</p>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['dashboard', 'enroll', 'batches', 'earnings'].map(tab => (
              <li key={tab}>
                <button
                  onClick={() => setActiveTab(tab)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '12px 24px',
                    background: activeTab === tab ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none', color: activeTab === tab ? 'var(--gold)' : '#fff',
                    cursor: 'pointer', textTransform: 'capitalize', fontSize: '15px'
                  }}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
          <div style={{ position: 'absolute', bottom: '24px', left: '24px' }}>
            <button onClick={handleLogout} className="btn btn-sm btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '32px' }}>
          <h1 style={{ fontSize: '24px', color: 'var(--text-main)', textTransform: 'capitalize', marginBottom: '24px' }}>
            {activeTab} Overview
          </h1>

          {loading ? (
            <div>Loading data...</div>
          ) : (
            <div>
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && data && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div className="card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Total Enrolled</div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-main)' }}>{data.total_candidates || 0}</div>
                  </div>
                  <div className="card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Active Batches</div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-main)' }}>{data.total_batches || 0}</div>
                  </div>
                  <div className="card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Certificates Issued</div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--success)' }}>{data.total_certificates || 0}</div>
                  </div>
                  <div className="card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Total Earnings</div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--gold)' }}>₹{data.total_earnings || 0}</div>
                  </div>
                </div>
              )}

              {/* Enroll Tab */}
              {activeTab === 'enroll' && (
                <div className="card" style={{ padding: '32px', maxWidth: '600px' }}>
                  <h3 style={{ marginBottom: '16px' }}>Enroll Candidate</h3>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
                    Use the bulk enrollment feature to upload an Excel file of your students, or contact admin for API integration.
                  </p>
                  <button className="btn btn-gold" onClick={() => alert('Bulk Excel Enrollment coming soon!')}>
                    Upload Bulk Excel
                  </button>
                </div>
              )}

              {/* Batches Tab */}
              {activeTab === 'batches' && data && (
                <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px' }}>Your Batches</h3>
                    <button className="btn btn-sm btn-gold">Create Batch</button>
                  </div>
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #eee' }}>
                        <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Batch Name</th>
                        <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Trade</th>
                        <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Students</th>
                        <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((b: any) => (
                        <tr key={b.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                          <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600 }}>{b.name}</td>
                          <td style={{ padding: '12px', fontSize: '14px' }}>{b.trade_name}</td>
                          <td style={{ padding: '12px', fontSize: '14px' }}>{b.student_count}</td>
                          <td style={{ padding: '12px', fontSize: '14px' }}>{b.status}</td>
                        </tr>
                      ))}
                      {data.length === 0 && <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center' }}>No batches found</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Earnings Tab */}
              {activeTab === 'earnings' && data && (
                <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px' }}>Commission Payouts</h3>
                  </div>
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #eee' }}>
                        <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Date</th>
                        <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Amount</th>
                        <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((e: any) => (
                        <tr key={e.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                          <td style={{ padding: '12px', fontSize: '14px' }}>{new Date(e.date).toLocaleDateString()}</td>
                          <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600, color: 'var(--success)' }}>₹{e.amount}</td>
                          <td style={{ padding: '12px', fontSize: '14px' }}>{e.status}</td>
                        </tr>
                      ))}
                      {data.length === 0 && <tr><td colSpan={3} style={{ padding: '24px', textAlign: 'center' }}>No earning records found</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Not logged in -> Show Marketing / Login
  return (
    <>
      <section className="page-hero" id="partner-hero">
        <div className="wrap">
          <span className="sec-eyebrow" style={{ color: 'var(--gold-light)' }}>Partnership Program</span>
          <h1>Become an <span style={{ color: 'var(--gold-light)' }}>Authorized Assessment Center</span></h1>
          <p className="page-hero-sub">
            Join CETCF's partner network. Earn commissions for every certified candidate.
            Operate your own government-authorized assessment center in your city.
          </p>
          <div style={{ marginTop: '24px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn btn-gold" onClick={() => setIsLoginView(false)}>Apply Now</button>
            <button className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }} onClick={() => setIsLoginView(true)}>
              AAC Login
            </button>
          </div>
        </div>
      </section>
      <div className="gold-rule"></div>

      <section className="section" id="partner-content">
        <div className="wrap">
          {isLoginView ? (
             <div className="card" style={{ padding: '40px', maxWidth: '400px', margin: '0 auto' }}>
              <h2 className="sec-title" style={{ textAlign: 'center', marginBottom: '24px' }}>AAC Partner Login</h2>
              {loginError && <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{loginError}</div>}
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Registered Phone Number</label>
                  <input type="tel" required className="form-input" value={loginPhone} onChange={e => setLoginPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" required className="form-input" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '16px' }}>Login to AAC Portal</button>
              </form>
             </div>
          ) : (
            <>
              {/* Application Form & Benefits */}
              <div style={{ marginBottom: '56px' }}>
                <span className="sec-eyebrow">Why Partner With CETCF?</span>
                <h2 className="sec-title">AAC Partner Benefits</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '32px' }}>
                  {[
                    { icon: <Wallet size={36} color="var(--cetc-gold)" />, title: 'Earn Per Certification', desc: 'Receive a commission for every candidate you certify.' },
                    { icon: <Landmark size={36} color="var(--cetc-gold)" />, title: 'Government Recognition', desc: 'Your center operates under CETCF\'s Section 8 license.' },
                    { icon: <ClipboardCheck size={36} color="var(--cetc-gold)" />, title: 'Ready-to-Use Exams', desc: 'We provide MCQs, online platform, and study materials.' }
                  ].map((item, i) => (
                    <div key={i} className="card" style={{ padding: '24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>{item.icon}</div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>{item.title}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Partner Logos & Presence ────────────────────── */}
              <div style={{ marginBottom: '80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '80px', alignItems: 'center' }}>
                <div>
                  <span className="sec-eyebrow">Pan-India Presence</span>
                  <h2 className="sec-title" style={{ marginBottom: '24px' }}>Empowering Skills Across The Nation</h2>
                  <p style={{ color: 'var(--muted)', fontSize: '16px', lineHeight: 1.7, marginBottom: '32px' }}>
                    With training centers and affiliated institutes spread across multiple states, we ensure that quality skill education reaches every corner of India.
                  </p>
                  <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid var(--border)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                    <IndiaMap />
                  </div>
                </div>

                <div>
                  <span className="sec-eyebrow">Affiliations & Partners</span>
                  <h2 className="sec-title" style={{ marginBottom: '48px' }}>Recognized By The Best</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '24px' }}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} style={{ background: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', transition: 'all 0.3s' }} className="partner-card">
                        <img 
                          src={`/partners/partner-${num}.jpeg`} 
                          alt={`Partner ${num}`} 
                          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', filter: 'grayscale(100%) opacity(0.7)', transition: 'all 0.3s', cursor: 'pointer' }}
                          onMouseOver={(e) => { 
                            e.currentTarget.style.filter = 'grayscale(0%) opacity(1)'; 
                            e.currentTarget.style.transform = 'scale(1.1)'; 
                            (e.currentTarget.parentElement as HTMLElement).style.borderColor = 'var(--gold)';
                            (e.currentTarget.parentElement as HTMLElement).style.boxShadow = '0 10px 30px rgba(184, 134, 11, 0.15)';
                          }}
                          onMouseOut={(e) => { 
                            e.currentTarget.style.filter = 'grayscale(100%) opacity(0.7)'; 
                            e.currentTarget.style.transform = 'scale(1)'; 
                            (e.currentTarget.parentElement as HTMLElement).style.borderColor = 'var(--border)';
                            (e.currentTarget.parentElement as HTMLElement).style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <span className="sec-eyebrow" style={{ textAlign: 'center', display: 'block' }}>Apply Now</span>
                <h2 className="sec-title" style={{ textAlign: 'center' }}>AAC Partner Application</h2>
                <form onSubmit={handleApply} id="partner-application-form">
                  <div className="card" style={{ padding: '32px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input className="form-input" type="text" name="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number *</label>
                        <input className="form-input" type="tel" name="phone" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input className="form-input" type="email" name="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Center Name</label>
                        <input className="form-input" type="text" name="centerName" value={formData.centerName} onChange={e => setFormData({...formData, centerName: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">City *</label>
                        <input className="form-input" type="text" name="city" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">State *</label>
                        <input className="form-input" type="text" name="state" required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                      <button type="submit" className="btn btn-gold btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Handshake size={18} /> Submit Application
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
