import { Link } from 'react-router-dom';
import { heroContent, stats, trustBadges } from '../../data/mockupContent';

function HomeHero() {
  const descriptionLines = heroContent.description.split('\n');

  return (
    <section className="hero hero-premium">
      <div className="hero-glow hero-glow-top" />
      <div className="hero-glow hero-glow-bottom" />
      <div className="hero-grid">
        <div className="hero-main">
          <div className="hero-badge">{heroContent.badge}</div>
          <p className="hero-kicker">Digital-First Certification Platform</p>
          <h1>
            Apni <em>{heroContent.highlight}</em> ko Official Certificate dein
          </h1>
          <p className="hero-sub">
            {descriptionLines.map((line, index) => (
              <span key={line}>
                {line}
                {index < descriptionLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
          <div className="hero-btns">
            <Link to="/certifications" className="btn-primary">
              {heroContent.primaryCta} <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link to="/verify" className="btn-outline">
              {heroContent.secondaryCta}
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-orbit" />
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={stat.label} className={`stat-card ${index === 0 ? 'featured' : ''}`}>
                <div className="stat-num">
                  {stat.value}
                  {stat.suffix ? <span>{stat.suffix}</span> : null}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="hero-rail" />
        </div>
      </div>
      <div className="trust-bar trust-bar-premium">
        <span className="trust-label">RECOGNISED BY</span>
        <div className="trust-badges">
          {trustBadges.map((badge) => (
            <span key={badge.label} className={`trust-badge tone-${badge.tone}`}>
              <span className="trust-icon">{badge.icon}</span>
              {badge.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomeHero;
