import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getUser, clearToken } from '../services/api';

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const [user, setUserData] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      navigate('/');
      return;
    }
    setUserData(currentUser);
    
    const fetchDashboard = async () => {
      try {
        const res: any = await api.candidates.getDashboard();
        if (res.success && res.enrollments) {
          setEnrollments(res.enrollments as any[]);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [navigate]);

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', color: '#fff' }}>Loading Dashboard...</div>;

  const handleLogout = () => {
    clearToken();
    navigate('/');
  };

  return (
    <section className="section" style={{ minHeight: '80vh' }}>
      <div className="wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 className="sec-title" style={{ marginBottom: '8px' }}>Student Dashboard</h1>
            <p className="sec-subtitle">Welcome back, {user?.name || user?.mobile}</p>
          </div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}>
            Logout
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
              Your Courses & Enrollments
            </h3>

            {enrollments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
                You haven't enrolled in any courses yet.<br/><br/>
                <Link to="/courses" className="btn btn-gold">Browse Courses</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {enrollments.map((enrol, idx) => (
                  <div key={idx} style={{ 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px', 
                    padding: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    background: 'rgba(255,255,255,0.02)'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        {enrol.pathway === 'video' ? 'Video Course + Exam' : 'Direct RPL Exam'}
                      </div>
                      <h4 style={{ fontSize: '18px', color: '#fff', marginBottom: '8px' }}>{enrol.trade_name}</h4>
                      <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        Status: <span style={{ color: enrol.status === 'passed' ? 'var(--success)' : '#fff', textTransform: 'capitalize' }}>{enrol.status}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {enrol.pathway === 'video' && (
                        <Link to={`/video/${enrol.trade_id}`} className="btn btn-outline" style={{ background: 'rgba(255,255,255,0.1)' }}>
                          ▶ Watch Videos
                        </Link>
                      )}
                      <Link to={`/exam?trade_id=${enrol.trade_id}`} className="btn btn-gold">
                        📝 Start Exam
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
