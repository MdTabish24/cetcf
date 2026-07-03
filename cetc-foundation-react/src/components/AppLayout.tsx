import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { GraduationCap, MapPin, Mail, Phone, Send, LogIn, Languages } from 'lucide-react';
import { useLang } from '../context/LangContext';

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, toggleLang, t } = useLang();
  const location = useLocation();
  const [isContactOpen, setIsContactOpen] = useState(false);

  const navItems = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.courses'), to: '/courses' },
    { label: t('nav.verify'), to: '/verify' },
    { label: t('nav.partner'), to: '/partner' },
    { label: t('nav.about'), to: '/about' },
  ];

  return (
    <>
      {/* ── Banner (Home Page Only) ────────────────────── */}
      {location.pathname === '/' && (
        <div style={{ width: '100%' }}>
          <img src="/cetcf_banner_header.png" alt="CETCF Banner" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
        </div>
      )}

      {/* ── Navbar ────────────────────────────────────────── */}
      <nav className="navbar" id="main-nav" style={{ background: 'rgba(2, 11, 24, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <div className="navbar-inner">
          <Link to="/" className="nav-brand" id="nav-brand" style={{ color: 'var(--text-main)' }}>
            <img src="/favicon.svg" alt="CETCF Logo" style={{ height: '36px', marginRight: '4px' }} />
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
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-main)' }}
              >
                <LogIn size={18} /> {t('nav.login')}
              </Link>
            </li>
            {/* Language Toggle */}
            <li>
              <button
                onClick={toggleLang}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  background: lang === 'hi' ? 'var(--gold)' : 'var(--bg-card)',
                  color: lang === 'hi' ? '#000' : 'var(--text-main)',
                  border: '1px solid var(--border)',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-ui)',
                }}
              >
                <Languages size={16} />
                {lang === 'en' ? 'हिंदी' : 'ENG'}
              </button>
            </li>
            <li>
              <Link
                to="/exam"
                className="nav-cta btn"
                onClick={() => setMenuOpen(false)}
                id="nav-cta-exam"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--gold)', color: '#fff', fontWeight: 700, borderRadius: '30px', boxShadow: '0 4px 10px rgba(184, 134, 11, 0.2)' }}
              >
                <GraduationCap size={18} /> {t('nav.getCertified')}
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
      <footer className="footer" id="main-footer" style={{ background: 'var(--navy-light)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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
                  <button onClick={() => setIsContactOpen(true)} className="btn btn-sm btn-outline" style={{ borderColor: 'var(--gold-light)', color: 'var(--gold-light)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Send size={16} /> Send Enquiry
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="footer-bottom">
            <p>
              © 2014 <strong>CETCF</strong> — Council for Education, Training & Certification Foundation. All rights reserved.
            </p>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms & Conditions</a>
              <a href="#">Refund Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Floating WhatsApp ───────────────────────────── */}
      <a href="https://wa.me/919272521793" target="_blank" rel="noopener noreferrer" className="whatsapp-float">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* ── Contact Modal ─────────────────────────────── */}
      {isContactOpen && (
        <div className="modal-overlay" onClick={() => setIsContactOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h2 className="sec-title" style={{ fontSize: '24px', marginBottom: '24px' }}>Send Enquiry</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              alert('Enquiry sent successfully! We will contact you soon.');
              setIsContactOpen(false);
            }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input type="tel" className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea className="form-input" rows={4} required></textarea>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsContactOpen(false)} style={{ color: '#fff' }}>Cancel</button>
                <button type="submit" className="btn btn-gold">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
