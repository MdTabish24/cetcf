import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Landmark, Award, ClipboardCheck, Globe, GraduationCap, PlayCircle, Trophy } from 'lucide-react';
import { SECTORS } from '../data/courses';
import { useLang } from '../context/LangContext';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HomePage() {
  const topSectors = SECTORS.slice(0, 12);
  const { t } = useLang();

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          FUTURISTIC HERO SECTION
          ══════════════════════════════════════════════════════ */}
      <section className="hero" id="hero">
        <div className="hero-orb hero-orb-1"></div>
        <div className="hero-orb hero-orb-2"></div>
        <div className="hero-orb hero-orb-3"></div>
        <div className="hero-inner">
          <div className="reveal">
            <div className="hero-eyebrow">
              <div className="dot"></div>
              <span>{t('hero.badge') || 'Admissions Open 2026'}</span>
            </div>
            <h1>
              <div className="line-normal">{t('hero.title1') || 'Empowering India'}</div>
              <div className="line-gold typing-animation">{t('hero.title2') || 'Through Skills'}</div>
            </h1>
            <p className="hero-sub">{t('hero.sub') || 'Get a globally recognized, NITI Aayog & ISO 9001:2015 certified skill certificate. Online exams, instant results, and QR-verifiable credentials for your career growth.'}</p>
            <div className="hero-btns">
              <Link to="/courses" className="btn-primary">
                <span>{t('hero.browseCourses') || 'Start Your Journey'}</span> <span className="arrow">→</span>
              </Link>
              <Link to="/verify" className="btn-ghost">
                <span>{t('hero.verifyCert') || 'Verify Certificate'}</span>
              </Link>
            </div>
            
            <div className="hero-stats">
              <div className="hero-stat stat-item">
                <div className="stat-num">225+</div>
                <div className="stat-label">{t('hero.stat.courses') || 'Courses'}</div>
              </div>
              <div className="hero-stat stat-item">
                <div className="stat-num">23</div>
                <div className="stat-label">{t('hero.stat.sectors') || 'Sectors'}</div>
              </div>
              <div className="hero-stat stat-item">
                <div className="stat-num">100%</div>
                <div className="stat-label">{t('hero.stat.online') || 'Online'}</div>
              </div>
              <div className="hero-stat stat-item">
                <div className="stat-num">₹1K</div>
                <div className="stat-label">{t('hero.stat.start') || 'Start'}</div>
              </div>
            </div>
          </div>
          
          <div className="hero-right reveal reveal-delay-2">
            <div className="growth-chart-wrapper glass-panel" style={{ padding: '30px', width: '100%', maxWidth: '380px', position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                 <h3 style={{ margin: 0, color: 'var(--gold2)', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Career Growth</h3>
              </div>
              <div className="growth-chart" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '160px', position: 'relative' }}>
                 <svg viewBox="0 0 100 100" style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, overflow: 'visible', zIndex: 2 }} preserveAspectRatio="none">
                    <motion.polyline 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                      points="5,80 23,65 41,45 59,25 77,10 95,-10" 
                      fill="none" 
                      stroke="var(--gold)" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(200,150,12,0.8))' }}
                    />
                    <motion.polygon
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2, duration: 0.3 }}
                      points="92,-5 98,-14 88,-12"
                      fill="var(--gold)"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(200,150,12,0.8))' }}
                    />
                    
                    {/* Glowing dots at data points */}
                    {[
                      {cx: 5, cy: 80}, {cx: 23, cy: 65}, {cx: 41, cy: 45}, 
                      {cx: 59, cy: 25}, {cx: 77, cy: 10}, {cx: 95, cy: -10}
                    ].map((pt, i) => (
                      <motion.circle 
                        key={`pt-${i}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + (i * 0.3), duration: 0.3 }}
                        cx={pt.cx} cy={pt.cy} r="2" fill="#fff"
                        style={{ filter: 'drop-shadow(0 0 4px var(--gold))' }}
                      />
                    ))}
                 </svg>
                 
                 {[20, 35, 55, 75, 90, 110].map((h, i) => (
                   <motion.div 
                     key={i}
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: `${h}%`, opacity: 1 }}
                     transition={{ duration: 0.6, delay: 0.2 + (i * 0.15) }}
                     style={{ 
                       width: '12%', 
                       background: 'linear-gradient(to top, rgba(200,150,12,0.1), rgba(200,150,12,0.8))',
                       borderRadius: '4px 4px 0 0',
                       boxShadow: '0 0 15px rgba(200,150,12,0.2)',
                       position: 'relative',
                       zIndex: 1
                     }}
                   />
                 ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TRUST BAR
          ══════════════════════════════════════════════════════ */}
      <section className="trust-bar" id="trust-bar" style={{ background: 'var(--surface)', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', padding: '40px 0' }}>
        <div className="wrap-lg">
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
            <div style={{ display: 'inline-flex', animation: 'scrollMarquee 20s linear infinite', gap: '40px', paddingRight: '40px' }}>
              {[
                { icon: <Landmark size={24} color="var(--gold)" />, text: t('trust.section8') },
                { icon: <Award size={24} color="var(--gold)" />, text: t('trust.iso') },
                { icon: <ClipboardCheck size={24} color="var(--gold)" />, text: t('trust.govt') },
                { icon: <Globe size={24} color="var(--gold)" />, text: t('trust.panIndia') },
                { icon: <GraduationCap size={24} color="var(--gold)" />, text: t('trust.rpl') },
                // Duplicate for seamless marquee loop
                { icon: <Landmark size={24} color="var(--gold)" />, text: t('trust.section8') },
                { icon: <Award size={24} color="var(--gold)" />, text: t('trust.iso') },
                { icon: <ClipboardCheck size={24} color="var(--gold)" />, text: t('trust.govt') },
                { icon: <Globe size={24} color="var(--gold)" />, text: t('trust.panIndia') },
                { icon: <GraduationCap size={24} color="var(--gold)" />, text: t('trust.rpl') }
              ].map((item, i) => (
                <div key={i} className="trust-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: 600, color: 'var(--text-main)' }}>
                  <div style={{ padding: '12px', background: 'rgba(184, 134, 11, 0.1)', borderRadius: '12px', border: '1px solid rgba(184, 134, 11, 0.2)' }}>
                    {item.icon}
                  </div>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PARTNERS
          ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '40px 0', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
        <div className="wrap">
          <p style={{ textAlign: 'center', fontSize: '14px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '32px' }}>
            Recognized By & Affiliated With
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5].map((num) => (
              <img 
                key={num}
                src={`/partners/partner-${num}.jpeg`} 
                alt={`Partner ${num}`} 
                style={{ height: '60px', objectFit: 'contain', filter: 'grayscale(100%) opacity(0.7)', transition: 'all 0.3s', cursor: 'pointer' }}
                onMouseOver={(e) => { e.currentTarget.style.filter = 'grayscale(0%) opacity(1)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseOut={(e) => { e.currentTarget.style.filter = 'grayscale(100%) opacity(0.7)'; e.currentTarget.style.transform = 'scale(1)'; }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TWO PATHWAYS
          ══════════════════════════════════════════════════════ */}
      <section className="pathways section" id="pathways">
        <div className="wrap">
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <motion.span initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="sec-eyebrow" style={{ color: 'var(--gold-light)' }}>{t('path.eyebrow')}</motion.span>
          </div>
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="sec-title" style={{ textAlign: 'center', color: '#ffffff' }}>
            {t('path.title1')} <span className="glow-text" style={{ color: 'var(--gold)' }}>{t('path.title2')}</span>
          </motion.h2>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="pathways-grid" 
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '60px' }}
          >
            {/* Path 1: Learn */}
            <motion.div variants={fadeIn} className="glass-panel" style={{ padding: '40px', position: 'relative', overflow: 'hidden', background: 'var(--surface)' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(184, 134, 11, 0.1) 0%, transparent 70%)', filter: 'blur(30px)' }} />
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(184, 134, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: '1px solid rgba(184, 134, 11, 0.2)', color: 'var(--gold)' }}>
                <PlayCircle size={32} />
              </div>
              <h3 style={{ fontSize: '28px', color: 'var(--text-main)', marginBottom: '16px' }}>{t('path.learn.title')}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '16px', marginBottom: '32px' }}>
                {t('path.learn.desc')}
              </p>
              <div style={{ marginTop: '24px' }}>
                <Link to="/courses" className="btn" style={{ background: 'var(--gold)', color: '#fff', fontWeight: 700 }}>
                  {t('path.learn.btn')}
                </Link>
              </div>
            </motion.div>

            {/* Path 2: RPL */}
            <motion.div variants={fadeIn} className="glass-panel" style={{ padding: '40px', position: 'relative', overflow: 'hidden', background: 'var(--surface)' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(194, 24, 91, 0.1) 0%, transparent 70%)', filter: 'blur(30px)' }} />
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(194, 24, 91, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: '1px solid rgba(194, 24, 91, 0.2)', color: 'var(--rose)' }}>
                <Trophy size={32} />
              </div>
              <h3 style={{ fontSize: '28px', color: 'var(--text-main)', marginBottom: '16px' }}>{t('path.rpl.title')}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '16px', marginBottom: '32px' }}>
                {t('path.rpl.desc')}
              </p>
              <div style={{ marginTop: '24px' }}>
                <Link to="/exam" className="btn btn-outline" style={{ borderColor: 'var(--rose)', color: 'var(--rose)' }}>
                  {t('path.rpl.btn')}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTORS GRID
          ══════════════════════════════════════════════════════ */}
      <section className="section" id="sectors" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80vw', height: '80vw', background: 'radial-gradient(circle, rgba(184, 134, 11, 0.03) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }} />
        
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <span className="sec-eyebrow" style={{ color: 'var(--gold)' }}>{t('sectors.eyebrow')}</span>
            <h2 className="sec-title" style={{ color: 'var(--text-main)' }}>
              {t('sectors.title1')} <span className="glow-text" style={{ color: 'var(--gold)' }}>{t('sectors.title2')}</span>
            </h2>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="sectors-grid" 
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginTop: '60px' }}
          >
            {topSectors.map((sector) => (
              <motion.div variants={fadeIn} key={sector.name}>
                <Link
                  to={`/courses?sector=${encodeURIComponent(sector.name)}`}
                  className="glass-panel"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px', 
                    padding: '24px', 
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    background: 'var(--surface)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px', 
                    background: 'rgba(184,134,11,0.05)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px solid rgba(184,134,11,0.1)'
                  }}>
                    {sector.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '16px' }}>{sector.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>{sector.count} {t('sectors.courses')}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/courses" className="btn btn-outline" style={{ borderColor: 'var(--navy)', color: 'var(--text-main)' }}>
              {t('sectors.viewAll')}
            </Link>
          </div>
        </div>
      </section>


    </>
  );
}
