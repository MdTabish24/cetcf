import { courseTrades, coursesTabs } from '../data/mockupContent';

function CertificationsPage() {
  return (
    <div className="page">
      <section className="page-hero">
        <div className="breadcrumb">Home &gt; <span>Certifications</span></div>
        <h1>All Certifications</h1>
        <p>Choose your trade and get officially certified in just 60 minutes</p>
      </section>

      <div className="tabs">
        {coursesTabs.map((tab, index) => (
          <div key={tab} className={`tab ${index === 0 ? 'active' : ''}`}>
            {tab}
          </div>
        ))}
      </div>

      <section className="section">
        <div className="trades trade-grid">
          {courseTrades.map((trade) => (
            <div key={trade.name} className="trade-card">
              <span className="trade-icon">{trade.icon}</span>
              <div className="trade-name">{trade.name}</div>
              <div className="trade-fee">{trade.fee}</div>
              {trade.details ? <div className="trade-details">{trade.details}</div> : null}
              <div className="trade-actions">
                <button className="btn-primary">Enroll Now</button>
                <button className="btn-outline">Syllabus</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default CertificationsPage;
