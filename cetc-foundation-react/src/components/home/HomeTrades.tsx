import { Link } from 'react-router-dom';
import { homeTrades } from '../../data/mockupContent';

function HomeTrades() {
  return (
    <section className="section section-premium">
      <div className="section-header split-header with-action">
        <div>
          <div className="section-title">Available Certifications</div>
          <div className="section-sub">Apna trade chunein aur officially certified ban jayein</div>
        </div>
        <Link to="/certifications" className="btn-secondary">
          Sab Trades Dekhein
        </Link>
      </div>
      <div className="trades">
        {homeTrades.map((trade) => (
          <Link key={trade.name} to="/certifications" className="trade-card">
            <span className="trade-icon">{trade.icon}</span>
            <div className="trade-name">{trade.name}</div>
            <div className="trade-fee">{trade.fee}</div>
            {trade.badge ? <span className="trade-badge">{trade.badge}</span> : null}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default HomeTrades;
