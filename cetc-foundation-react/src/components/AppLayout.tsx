import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { GraduationCap, MapPin, Mail, Phone, Send, LogIn } from 'lucide-react';

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Courses', to: '/courses' },
    { label: 'Verify', to: '/verify' },
    { label: 'Partner (AAC)', to: '/partner' },
    { label: 'About', to: '/about' },
  ];

  return (
    <>
      {/* ── Navbar ────────────────────────────────────────── */}
      <nav className="navbar" id="main-nav">
        <div className="navbar-inner">
          <Link to="/" className="nav-brand" id="nav-brand">
            <div className="nav-brand-icon">CT</div>
            <div className="nav-brand-text">
              <span className="nav-brand-name">CETCF</span>
              <span className="nav-brand-sub">Education · Training · Certification</span>
            </div>
          </Link>

          <ul className={`nav-links ${menuOpen ? 'open' : ''}`} id="nav-links">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => isActive ? 'active' : ''}
                  onClick={() => setMenuOpen(false)}
                  end={item.to === '/'}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <Link
                to="/login"
                className="nav-link-login"
                onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--cetc-gold)' }}
              >
                <LogIn size={18} /> Login
              </Link>
            </li>
            <li>
              <Link
                to="/exam"
                className="nav-cta"
                onClick={() => setMenuOpen(false)}
                id="nav-cta-exam"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <GraduationCap size={18} /> Get Certified
              </Link>
            </li>
          </ul>

          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            id="nav-hamburger"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* ── Gold Divider ──────────────────────────────────── */}
      <div className="gold-rule"></div>

      {/* ── Page Content ──────────────────────────────────── */}
      <main>
        <Outlet />
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="footer" id="main-footer">
        <div className="wrap-lg">
          <div className="footer-grid">
            {/* Brand */}
            <div>
              <div className="footer-brand-name">CETCF</div>
              <p className="footer-brand-desc">
                Council for Education, Training & Certification Foundation.
                ISO 9001:2015 Certified · Section 8 Company · Thane, Maharashtra.
                Empowering India's workforce through accessible, government-recognized certifications.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-foundation" style={{ fontSize: '10px' }}>ISO 9001:2015</span>
                <span className="badge badge-intermediate" style={{ fontSize: '10px' }}>Section 8 Company</span>
                <span className="badge badge-advanced" style={{ fontSize: '10px' }}>Govt. Recognized</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/courses">All Courses</Link></li>
                <li><Link to="/verify">Verify Certificate</Link></li>
                <li><Link to="/exam">Take Exam</Link></li>
                <li><Link to="/partner">Become Partner</Link></li>
              </ul>
            </div>

            {/* Popular Sectors */}
            <div>
              <h4 className="footer-heading">Top Sectors</h4>
              <ul className="footer-links">
                <li><Link to="/courses?sector=Beauty+%26+Lifestyle">Beauty & Lifestyle</Link></li>
                <li><Link to="/courses?sector=Digital+%26+Information+Technology">Digital & IT</Link></li>
                <li><Link to="/courses?sector=Healthcare+%26+Medical+Support">Healthcare</Link></li>
                <li><Link to="/courses?sector=Electrical+%26+Electronics+Trades">Electrical Trades</Link></li>
                <li><Link to="/courses?sector=Construction+%26+Building+Trades">Construction</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="footer-heading">Contact Us</h4>
              <ul className="footer-links">
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /> Thane, Maharashtra, India</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16} /> info@cetcf.org</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} /> +91 XXXX XXXX XX</li>
                <li style={{ marginTop: '12px' }}>
                  <Link to="/contact" className="btn btn-sm btn-outline" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Send size={16} /> Send Enquiry
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="footer-bottom">
            <p>
              © {new Date().getFullYear()} <strong>CETCF</strong> — Council for Education, Training & Certification Foundation. All rights reserved.
            </p>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms & Conditions</a>
              <a href="#">Refund Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
