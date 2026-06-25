import { useState } from 'react';
import { Search, Hourglass, Lock, Zap, Download, XCircle, ClipboardCheck, Smartphone, Mail } from 'lucide-react';
import api from '../services/api';

export default function VerifyPage() {
  const [certNumber, setCertNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | 'found' | 'not_found' | 'revoked'>(null);
  const [certData, setCertData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNumber.trim()) return;
    
    setLoading(true);
    setResult(null);
    setErrorMessage('');
    
    try {
      const res = await api.certificates.verify(certNumber.trim());
      
      if (res.success && res.valid) {
        setResult('found');
        setCertData(res.certificate);
      } else {
        setResult('not_found');
        setErrorMessage(res.message || 'Certificate not found. Please check the number.');
      }
    } catch (err) {
      setResult('not_found');
      setErrorMessage('Verification failed due to a network error.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <>
      {/* Page Hero */}
      <section className="page-hero" id="verify-hero">
        <div className="wrap">
          <span className="sec-eyebrow" style={{ color: 'var(--gold-light)' }}>Certificate Verification</span>
          <h1>Verify a <span style={{ color: 'var(--gold-light)' }}>CETCF Certificate</span></h1>
          <p className="page-hero-sub">
            Enter the certificate number or scan the QR code to verify its authenticity.
            All CETCF certificates are digitally signed and verifiable.
          </p>
        </div>
      </section>
      <div className="gold-rule"></div>

      <section className="section" id="verify-form-section">
        <div className="wrap-sm">
          <div className="verify-card" id="verify-card">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: 'var(--cetc-gold)' }}><Search size={48} /></div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--navy)', marginBottom: '6px' }}>
                Certificate Verification Portal
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                Enter the certificate number printed on your CETCF certificate
              </p>
            </div>

            <form onSubmit={handleVerify}>
              <div className="verify-input-group">
                <input
                  type="text"
                  className="verify-input"
                  placeholder="e.g., CETC/2025/BEAUTY/000123"
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value)}
                  id="verify-cert-input"
                />
                <button
                  type="submit"
                  className="btn btn-gold"
                  disabled={loading || !certNumber.trim()}
                  id="verify-submit-btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {loading ? <><Hourglass size={18} /> Verifying...</> : <><Search size={18} /> Verify</>}
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', gap: '16px', marginTop: '20px', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={14} /> Secure & Encrypted
              </span>
              <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={14} /> Instant Results
              </span>
            </div>

            {/* Result */}
            {result === 'found' && certData && (
              <div className="verify-result" id="verify-result-found">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    ✓
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--success)' }}>Certificate Verified ✓</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>This certificate is genuine and valid.</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                  {[
                    { label: 'Candidate Name', value: certData.candidateName },
                    { label: 'Certificate No', value: certData.certNumber },
                    { label: 'Course', value: certData.tradeName },
                    { label: 'Grade', value: `${certData.grade} (${certData.percentage}%)` },
                    { label: 'Issue Date', value: formatDate(certData.issueDate) },
                    { label: 'Issuing Center', value: certData.issuingCenter },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '10px 14px', background: 'rgba(27,122,74,0.06)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)', marginTop: '2px' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                
                {certData.pdfUrl && (
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                     <a href={certData.pdfUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                       <Download size={16} /> Download PDF Copy
                     </a>
                  </div>
                )}
              </div>
            )}

            {result === 'not_found' && (
              <div style={{
                marginTop: '24px',
                padding: '24px',
                borderRadius: '16px',
                border: '2px solid var(--danger)',
                background: 'rgba(198,40,40,0.04)',
                textAlign: 'center',
              }} id="verify-result-notfound">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: 'var(--danger)' }}><XCircle size={36} /></div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--danger)' }}>Verification Failed</div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '6px' }}>
                  {errorMessage}
                </p>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
            {[
              { icon: <ClipboardCheck size={28} />, title: 'Where to find it?', desc: 'The certificate number is printed in the top-right corner of your CETCF certificate.' },
              { icon: <Smartphone size={28} />, title: 'QR Code', desc: 'You can also scan the QR code on your certificate using any smartphone camera.' },
              { icon: <Mail size={28} />, title: 'Need Help?', desc: 'Contact info@cetcf.org or call us for verification assistance.' },
            ].map((item, i) => (
              <div key={i} className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: 'var(--navy)' }}>{item.icon}</div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)', marginBottom: '6px' }}>{item.title}</h4>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
