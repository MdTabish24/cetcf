import { useState, useEffect } from 'react';
import api, { getUser, setToken, setUser, clearToken } from '../services/api';

export default function AdminPage() {
  const [user, setLocalUser] = useState(getUser());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await api.auth.adminLogin(email, password);
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

  const fetchData = async () => {
    setLoading(true);
    setData(null);
    try {
      if (activeTab === 'dashboard') {
        const res = await api.admin.getDashboard();
        if (res.success) setData(res.data || res.dashboard);
      } else if (activeTab === 'partners') {
        const res = await api.admin.getPartners();
        if (res.success) setData(res.partners);
      } else if (activeTab === 'candidates') {
        const res = await api.admin.getCandidates();
        if (res.success) setData(res.candidates);
      } else if (activeTab === 'certificates') {
        const res = await api.admin.getCertificates();
        if (res.success) setData(res.certificates);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handlePartnerStatus = async (id: number, status: string) => {
    const res = await api.admin.updatePartnerStatus(id, status);
    if (res.success) fetchData();
    else alert(res.message);
  };

  if (!isAdmin) {
    return (
      <section className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="wrap-sm">
          <div className="card" style={{ padding: '40px', maxWidth: '400px', margin: '0 auto' }}>
            <h2 className="sec-title" style={{ textAlign: 'center', marginBottom: '24px' }}>Admin Login</h2>
            {loginError && <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{loginError}</div>}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" required className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" required className="form-input" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '16px' }}>Login to Dashboard</button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: 'var(--navy)', color: '#fff', padding: '24px 0', position: 'relative' }}>
        <div style={{ padding: '0 24px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', color: 'var(--gold)' }}>CETCF Admin</h2>
          <p style={{ fontSize: '12px', opacity: 0.7 }}>System Control Panel</p>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {['dashboard', 'partners', 'candidates', 'certificates'].map(tab => (
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
        <h1 style={{ fontSize: '24px', color: 'var(--navy)', textTransform: 'capitalize', marginBottom: '24px' }}>
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
                  <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Total Candidates</div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--navy)' }}>{data.total_candidates || 0}</div>
                </div>
                <div className="card" style={{ padding: '24px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Total Partners</div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--navy)' }}>{data.total_partners || 0}</div>
                </div>
                <div className="card" style={{ padding: '24px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Certificates Issued</div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--success)' }}>{data.total_certificates || 0}</div>
                </div>
                <div className="card" style={{ padding: '24px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Total Revenue</div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--gold)' }}>₹{data.total_revenue || 0}</div>
                </div>
              </div>
            )}

            {/* Partners Tab */}
            {activeTab === 'partners' && data && (
              <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Center Name</th>
                      <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Contact</th>
                      <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>City</th>
                      <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Status</th>
                      <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((p: any) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                        <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600 }}>{p.org_name || p.name}</td>
                        <td style={{ padding: '12px', fontSize: '13px' }}>{p.email}<br/><span style={{ color: 'var(--muted)' }}>{p.phone}</span></td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{p.city}, {p.state}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>
                          <span style={{ 
                            padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                            background: p.status === 'approved' ? 'rgba(27,122,74,0.1)' : 'rgba(217,119,6,0.1)',
                            color: p.status === 'approved' ? 'var(--success)' : '#d97706'
                          }}>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {p.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => handlePartnerStatus(p.id, 'approved')} className="btn btn-sm btn-gold" style={{ padding: '4px 8px', fontSize: '11px' }}>Approve</button>
                              <button onClick={() => handlePartnerStatus(p.id, 'rejected')} className="btn btn-sm btn-outline" style={{ padding: '4px 8px', fontSize: '11px' }}>Reject</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {data.length === 0 && <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center' }}>No partners found</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {/* Candidates Tab */}
            {activeTab === 'candidates' && data && (
              <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Name</th>
                      <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Mobile</th>
                      <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Enrollment No</th>
                      <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Reg Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((c: any) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                        <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600 }}>{c.name}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{c.mobile}</td>
                        <td style={{ padding: '12px', fontSize: '14px', fontFamily: 'monospace' }}>{c.enrollment_no}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {data.length === 0 && <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center' }}>No candidates found</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {/* Certificates Tab */}
            {activeTab === 'certificates' && data && (
              <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Cert Number</th>
                      <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Candidate</th>
                      <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Trade</th>
                      <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Grade</th>
                      <th style={{ padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((c: any) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                        <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600, fontFamily: 'monospace' }}>{c.cert_number}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{c.candidate_name}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{c.trade_name}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{c.grade} ({c.percentage}%)</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>
                          <span style={{ color: c.is_revoked ? 'var(--danger)' : 'var(--success)' }}>
                            {c.is_revoked ? 'Revoked' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {data.length === 0 && <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center' }}>No certificates found</td></tr>}
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
