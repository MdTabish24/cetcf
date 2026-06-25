import { Link } from 'react-router-dom';
import { Star, BookOpen, Search, Landmark, Award, ClipboardCheck, Globe, GraduationCap, PlayCircle, Trophy, Smartphone, Wallet, RefreshCw, Handshake } from 'lucide-react';
import { SECTORS } from '../data/courses';

export default function HomePage() {
  const topSectors = SECTORS.slice(0, 12);

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════════════════════ */}
      <section className="hero" id="hero">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-eyebrow">
              <span style={{ display: 'inline-flex', alignItems: 'center' }}><Star size={14} style={{ marginRight: '4px' }}/></span> Government Recognized · ISO 9001:2015 Certified
            </div>
            <h1>
              Get <span className="gold">Certified.</span><br />
              Get <span className="rose">Hired.</span>
            </h1>
            <p className="hero-sub">
              CETCF offers 225+ government-recognized vocational certifications across 23 sectors.
              Learn at your pace, pass the online exam, and receive your certificate — all from home.
            </p>
            <div className="hero-btns">
              <Link to="/courses" className="btn btn-gold btn-lg" id="hero-cta-courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} /> Browse Courses
              </Link>
              <Link to="/verify" className="btn btn-outline btn-lg" id="hero-cta-verify" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Search size={18} /> Verify Certificate
              </Link>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-stats-grid">
              <div className="hero-stat">
                <div className="hero-stat-value">225+</div>
                <div className="hero-stat-label">Courses</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">23</div>
                <div className="hero-stat-label">Sectors</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">100%</div>
                <div className="hero-stat-label">Online Exam</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">₹1K</div>
                <div className="hero-stat-label">Starting Fee</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TRUST BAR
          ══════════════════════════════════════════════════════ */}
      <section className="trust-bar" id="trust-bar">
        <div className="wrap-lg">
          <div className="trust-items">
            <div className="trust-item">
              <span className="trust-icon"><Landmark size={24} color="var(--cetc-gold)" /></span>
              Section 8 Company (Govt. of India)
            </div>
            <div className="trust-item">
              <span className="trust-icon"><Award size={24} color="var(--cetc-gold)" /></span>
              ISO 9001:2015 Certified
            </div>
            <div className="trust-item">
              <span className="trust-icon"><ClipboardCheck size={24} color="var(--cetc-gold)" /></span>
              Sec. 8 Lic. 181729
            </div>
            <div className="trust-item">
              <span className="trust-icon"><Globe size={24} color="var(--cetc-gold)" /></span>
              Pan-India Recognition
            </div>
            <div className="trust-item">
              <span className="trust-icon"><GraduationCap size={24} color="var(--cetc-gold)" /></span>
              RPL + Training Dual Pathway
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TWO PATHWAYS (Revenue Streams)
          ══════════════════════════════════════════════════════ */}
      <section className="pathways" id="pathways">
        <div className="wrap">
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <span className="sec-eyebrow" style={{ color: 'var(--gold-light)' }}>How It Works</span>
          </div>
          <h2 className="sec-title" style={{ textAlign: 'center', color: '#fff' }}>
            Two Ways to Get <span>Certified</span>
          </h2>
          <p className="sec-subtitle" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', margin: '0 auto' }}>
            Whether you're starting fresh or already have skills — there's a path for you.
          </p>

          <div className="pathways-grid">
            {/* Path 1: Buy Course + Certify */}
            <div className="pathway-card gold">
              <div className="pathway-icon"><PlayCircle size={32} /></div>
              <h3 className="pathway-title">Learn & Get Certified</h3>
              <p className="pathway-desc">
                Purchase our video course, study at your own pace, and when ready — take the online MCQ exam. Pass and receive your government-recognized certificate.
              </p>
              <ul className="pathway-steps">
                <li>
                  <span className="step-num">1</span>
                  Choose your course & pay the fee
                </li>
                <li>
                  <span className="step-num">2</span>
                  Watch video lessons & study material
                </li>
                <li>
                  <span className="step-num">3</span>
                  Take the online MCQ exam (from home)
                </li>
                <li>
                  <span className="step-num">4</span>
                  Pass with 50% & get your certificate instantly
                </li>
              </ul>
              <div style={{ marginTop: '24px' }}>
                <Link to="/courses" className="btn btn-gold">
                  Browse Courses →
                </Link>
              </div>
            </div>

            {/* Path 2: Direct Certification (RPL) */}
            <div className="pathway-card rose">
              <div className="pathway-icon"><Trophy size={32} /></div>
              <h3 className="pathway-title">Already Skilled? Get Certified Directly</h3>
              <p className="pathway-desc">
                If you already have the skills (learned from work, ITI, or other training) — skip the course. Pay the exam fee, pass the MCQ test, and get your government certificate.
              </p>
              <ul className="pathway-steps">
                <li>
                  <span className="step-num">1</span>
                  Select your trade & pay exam fee
                </li>
                <li>
                  <span className="step-num">2</span>
                  Take the online MCQ exam (100 questions)
                </li>
                <li>
                  <span className="step-num">3</span>
                  Score 50% or above to pass
                </li>
                <li>
                  <span className="step-num">4</span>
                  Download your CETCF certificate with QR verification
                </li>
              </ul>
              <div style={{ marginTop: '24px' }}>
                <Link to="/exam" className="btn btn-rose">
                  Take Exam Now →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTORS GRID
          ══════════════════════════════════════════════════════ */}
      <section className="section" id="sectors">
        <div className="wrap">
          <span className="sec-eyebrow">Explore Sectors</span>
          <h2 className="sec-title">
            23 Industry Sectors, <span>225+ Certifications</span>
          </h2>
          <p className="sec-subtitle">
            From beauty to IT, healthcare to agriculture — we cover India's most in-demand vocational skills.
          </p>

          <div className="sectors-grid">
            {topSectors.map((sector) => (
              <Link
                to={`/courses?sector=${encodeURIComponent(sector.name)}`}
                key={sector.name}
                className="sector-card"
                id={`sector-${sector.name.replace(/[^a-zA-Z]/g, '-').toLowerCase()}`}
              >
                <div
                  className="sector-icon"
                  style={{ background: `${sector.color}15`, border: `1px solid ${sector.color}30` }}
                >
                  {sector.icon}
                </div>
                <div className="sector-info">
                  <div className="sector-name">{sector.name}</div>
                  <div className="sector-count">{sector.count} Courses</div>
                </div>
              </Link>
            ))}
          </div>

          {SECTORS.length > 12 && (
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link to="/courses" className="btn btn-outline-dark">
                View All {SECTORS.length} Sectors →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          WHY CETCF
          ══════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--warm)' }} id="why-cetcf">
        <div className="wrap">
          <div style={{ textAlign: 'center' }}>
            <span className="sec-eyebrow">Why Choose Us</span>
            <h2 className="sec-title">India's Trusted Certification Body</h2>
            <p className="sec-subtitle" style={{ margin: '0 auto' }}>
              Government-registered, ISO-certified, and trusted by thousands of students and institutions across India.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '40px' }}>
            {[
              { icon: <Landmark size={36} color="var(--cetc-gold)"/>, title: 'Government Recognized', desc: 'Section 8 Company registered under the Ministry of Corporate Affairs, Government of India.' },
              { icon: <Globe size={36} color="var(--cetc-gold)"/>, title: '100% Online Exams', desc: 'Take your certification exam from anywhere. No travel needed. Results in real-time.' },
              { icon: <Smartphone size={36} color="var(--cetc-gold)"/>, title: 'Digital Certificates', desc: 'QR-verified digital certificates issued instantly. Physical copy couriered within 10-15 days.' },
              { icon: <Wallet size={36} color="var(--cetc-gold)"/>, title: 'Affordable Fees', desc: 'Starting at just ₹1,000. Quality certification shouldn\'t cost a fortune.' },
              { icon: <RefreshCw size={36} color="var(--cetc-gold)"/>, title: 'RPL Pathway', desc: 'Already skilled? Skip the course — directly take the exam and get certified.' },
              { icon: <Handshake size={36} color="var(--cetc-gold)"/>, title: 'Partner Network', desc: 'Join as an Authorized Assessment Center (AAC) and earn commissions per certified candidate.' },
            ].map((item, i) => (
              <div key={i} className="card" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA BANNER
          ══════════════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)',
        padding: '64px 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }} id="cta-banner">
        <div className="wrap" style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 3.5vw, 40px)',
            color: '#fff',
            fontWeight: 700,
            marginBottom: '12px',
          }}>
            Ready to Start Your <span style={{ color: 'var(--gold-light)' }}>Certification Journey</span>?
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', maxWidth: '500px', margin: '0 auto 28px', lineHeight: 1.7 }}>
            Join thousands of certified professionals. Your career upgrade is just one exam away.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/courses" className="btn btn-gold btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} /> Explore 225+ Courses
            </Link>
            <Link to="/partner" className="btn btn-outline btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Handshake size={18} /> Become a Partner
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
