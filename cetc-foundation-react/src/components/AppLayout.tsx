import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { footerBadges, footerColumns, navItems } from '../data/mockupContent';

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="site-shell">
      <header className="site-nav">
        <NavLink to="/" className="logo">
          CETC <span>Foundation</span>
        </NavLink>

        <button
          type="button"
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`} aria-label="Main Navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              end={item.to === '/'}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/certifications" className="nav-cta" onClick={() => setMenuOpen(false)}>
            Enroll Now
          </NavLink>
        </nav>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="logo">CETC <span>Foundation</span></span>
            <p className="footer-desc">
              Council for Education, Training and Certification Foundation. ISO 9001:2015 Certified Assessment Body. Section 8 Company under MCA.
            </p>
            <div className="footer-badges">
              {footerBadges.map((badge) => (
                <span key={badge}>{badge}</span>
              ))}
            </div>
          </div>
          {footerColumns.map((column) => (
            <div key={column.title} className="footer-col">
              <h4>{column.title}</h4>
              <ul className="footer-links">
                {column.links.map((link) => (
                  <li key={link}><span>{link}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>{'\u00A9'} 2025 CETC Foundation. All rights reserved.</span>
          <span>Section 8 Company &bull; CIN: U80903MH2025NPL000000</span>
        </div>
      </footer>
    </div>
  );
}

export default AppLayout;
