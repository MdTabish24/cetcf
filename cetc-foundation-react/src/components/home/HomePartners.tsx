import { Link } from 'react-router-dom';
import { partnerCards } from '../../data/mockupContent';

function HomePartners() {
  return (
    <section className="section section-premium">
      <div className="partner-strip">
        <span>High Demand</span>
        <span>Monthly Payout</span>
        <span>National Reach</span>
      </div>
      <div className="section-header">
        <div className="section-title">Partner ban kar kamaein</div>
        <div className="section-sub">Apne institute se students ko certify karwayein aur har candidate pe commission payein</div>
      </div>
      <div className="partner-grid">
        {partnerCards.map((partner) => (
          <div key={partner.title} className={`partner-card ${partner.highlight ? 'highlight' : ''}`}>
            <div className="partner-type">{partner.highlight ? partner.highlightLabel : partner.type}</div>
            <div className="partner-title">{partner.title}</div>
            <div className="partner-earn">{partner.earn}</div>
            <div className="partner-earn-label">{partner.earnLabel}</div>
            <ul className="partner-list">
              {partner.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Link to="/partner" className="btn-primary full-width">
              Register as Partner
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HomePartners;
