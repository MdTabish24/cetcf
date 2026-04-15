import { useState } from 'react';
import { certificateApi } from '../services/api';

interface CertificateResult {
  certNumber: string;
  candidateName: string;
  candidatePhoto?: string;
  tradeName: string;
  grade: string;
  score: number;
  percentage: number;
  issueDate: string;
  issuingCenter: string;
  pdfUrl?: string;
  whatsAppShareText?: string;
}

function VerifyPage() {
  const [certInput, setCertInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertificateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    const trimmed = certInput.trim();
    if (!trimmed) {
      setError('Please enter a certificate number.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const response = await certificateApi.verify(trimmed);

    if (response.success && response.valid) {
      setResult(response.certificate as CertificateResult);
    } else {
      setError(
        (response.message as string) ||
          'Certificate not found — This may be fake. Please verify the certificate number carefully.'
      );
    }
    setLoading(false);
  }

  function handleShare() {
    if (result?.whatsAppShareText) {
      const url = `https://wa.me/?text=${encodeURIComponent(result.whatsAppShareText)}`;
      window.open(url, '_blank');
    }
  }

  const gradeColors: Record<string, string> = { A: '#10b981', B: '#3b82f6', C: '#f59e0b' };

  return (
    <div className="page">
      <section className="page-hero">
        <div className="breadcrumb">
          Home &gt; <span>Verify Certificate</span>
        </div>
        <h1>Certificate Verification Portal</h1>
        <p>Instantly verify the authenticity of any CETC Foundation certificate</p>
      </section>

      <section className="verify-box">
        <div className="verify-icon">🔍</div>
        <div className="verify-title">Verify CETC Certificate</div>
        <div className="verify-sub">
          Enter the certificate number (format: CETC/YEAR/TRADE/NUMBER) or scan the QR code on the certificate
        </div>

        <div className="input-row">
          <input
            className="cert-input"
            type="text"
            placeholder="e.g. CETC/2025/BEAUTY/001247"
            value={certInput}
            onChange={(e) => setCertInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            disabled={loading}
          />
          <button
            className="btn-primary"
            onClick={handleVerify}
            type="button"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>

        <div className="verify-or">or</div>
        <button className="btn-outline full-width" type="button" disabled>
          📷 Scan QR Code (Mobile)
        </button>

        {/* Error State */}
        {error && (
          <div className="verify-result show" style={{ borderColor: '#ef4444' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>❌</div>
            <div className="result-name" style={{ color: '#ef4444' }}>
              Verification Failed
            </div>
            <div className="result-trade" style={{ color: '#f87171' }}>
              {error}
            </div>
          </div>
        )}

        {/* Success State */}
        {result && (
          <div className="verify-result show">
            <div className="result-check">✅</div>
            <div className="result-name">{result.candidateName}</div>
            <div className="result-trade">{result.tradeName}</div>

            <div className="result-grid">
              {[
                ['Certificate No.', result.certNumber],
                [
                  'Grade',
                  <span key="grade" style={{ color: gradeColors[result.grade] || '#ffffff', fontWeight: 700 }}>
                    {result.grade}
                  </span>,
                ],
                ['Score', `${result.score} marks`],
                ['Percentage', `${result.percentage}%`],
                [
                  'Issue Date',
                  new Date(result.issueDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  }),
                ],
                ['Issuing Center', result.issuingCenter],
              ].map(([label, value]) => (
                <div key={String(label)} className="result-item">
                  <label>{label}</label>
                  <span>{value}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '1.25rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              {result.pdfUrl && (
                <a
                  href={result.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                >
                  📄 Download Certificate
                </a>
              )}
              <button className="btn-outline" type="button" onClick={handleShare}>
                🟢 Share on WhatsApp
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default VerifyPage;
