import { Link } from 'react-router-dom';
import { certificateCard, certificateFeatures } from '../../data/mockupContent';

function HomeCertificate() {
  const footerLines = certificateCard.footerLeft.split('\n');

  return (
    <section className="section section-alt section-premium">
      <div className="cert-preview">
        <div className="cert-copy">
          <div className="section-title">Tamper-proof Digital Certificate</div>
          <div className="section-sub">QR code se verify hone wala certificate jo employers trust karte hain</div>
          <ul className="cert-features">
            {certificateFeatures.map((feature) => (
              <li key={feature.text}>
                <span className="feat-icon">{feature.icon}</span>
                {feature.text}
              </li>
            ))}
          </ul>
          <Link to="/verify" className="btn-primary" style={{ marginTop: '28px' }}>
            Sample Certificate Verify Karein &rarr;
          </Link>
        </div>
        <div className="cert-stage">
          <div className="cert-card">
          <div className="cert-logo">{certificateCard.logo}</div>
          <div className="cert-seal">{certificateCard.seal}</div>
          <div className="cert-title-label">{certificateCard.titleLabel}</div>
          <div className="cert-title">{certificateCard.title.split(' & ').map((part, index) => (
            <span key={part}>
              {part}
              {index === 0 ? <br /> : null}
            </span>
          ))}</div>
          <div className="cert-name-label">{certificateCard.nameLabel}</div>
          <div className="cert-name">{certificateCard.name}</div>
          <div className="cert-desc">{certificateCard.description}</div>
          <div className="cert-meta">{certificateCard.meta}</div>
          <div className="cert-footer">
            <div className="cert-id">
              {footerLines.map((line, index) => (
                <span key={line}>
                  {line}
                  {index < footerLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </div>
            <div className="cert-qr">{certificateCard.footerRight}</div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeCertificate;
