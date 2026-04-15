import { adminChartBars, adminMenu, adminMetrics } from '../data/mockupContent';

function AdminPage() {
  return (
    <div className="page">
      <section className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-brand">CETC Admin</div>
          <ul className="admin-menu">
            {adminMenu.map((item, index) => (
              <li key={item} className={index === 0 ? 'active' : undefined}>
                {item}
              </li>
            ))}
          </ul>
        </aside>
        <div className="admin-content">
          <div className="admin-title">Dashboard</div>
          <div className="admin-date">Thursday, 19 March 2026 — Live data</div>
          <div className="metrics">
            {adminMetrics.map((metric) => (
              <div key={metric.label} className="metric">
                <div className="metric-label">{metric.label}</div>
                <div className="metric-val">{metric.value}</div>
                <div className="metric-change">{metric.change}</div>
              </div>
            ))}
          </div>
          <div className="chart-bar-wrap">
            <div className="chart-title">Monthly Certifications — 2025</div>
            <div className="bar-chart">
              {adminChartBars.map((bar) => (
                <div key={bar.month} className="bar-col">
                  <div className={`bar ${bar.highlight ? 'highlight' : ''}`} style={{ height: `${bar.height}px` }} />
                  <div className="bar-label">{bar.month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminPage;
