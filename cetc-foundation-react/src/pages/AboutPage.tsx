import { motion } from 'framer-motion';
import { Target, Lightbulb, Users, Globe2, BookOpen, Award, Shield, CheckCircle } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { Link } from 'react-router-dom';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function AboutPage() {
  const { t } = useLang();

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* ── Page Hero ───────────────────────────────────────── */}
      <section className="page-hero" style={{ background: 'linear-gradient(rgba(13, 27, 62, 0.9), rgba(13, 27, 62, 0.9)), url("/hero-bg.avif") center/cover', padding: '120px 0 80px', textAlign: 'center', color: '#fff' }}>
        <div className="wrap">
          <motion.h1 
            initial="hidden" animate="visible" variants={fadeIn}
            style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800, marginBottom: '24px' }}
          >
            {t('about.title1')} <span style={{ color: 'var(--gold)' }}>{t('about.title2')}</span>
          </motion.h1>
          <motion.p 
            initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }}
            style={{ fontSize: '20px', color: 'rgba(255,255,255,0.8)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}
          >
            {t('about.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* ── Who We Are ──────────────────────────────────────── */}
      <section className="wrap section" style={{ marginTop: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <span className="sec-eyebrow">{t('about.story.eyebrow')}</span>
            <h2 className="sec-title">{t('about.story.title')}</h2>
            <p style={{ color: 'var(--muted)', fontSize: '17px', lineHeight: 1.7, marginBottom: '16px' }}>
              {t('about.story.p1')}
            </p>
            <p style={{ color: 'var(--muted)', fontSize: '17px', lineHeight: 1.7, marginBottom: '24px' }}>
              {t('about.story.p2')}
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                t('about.story.list.1'),
                t('about.story.list.2'),
                t('about.story.list.3'),
                t('about.story.list.4')
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
                  <CheckCircle size={20} color="var(--success)" /> {item}
                </li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100%', height: '100%', border: '2px solid var(--gold)', borderRadius: '24px', zIndex: 0 }}></div>
            <img src="/hero-bg.avif" alt="Our impact" style={{ position: 'relative', zIndex: 1, borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', objectFit: 'cover', height: '450px', width: '100%' }} />
          </motion.div>
        </div>
      </section>

      {/* ── Mission & Vision ──────────────────────────────────── */}
      <section className="wrap section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
          style={{ background: 'var(--bg-card)', padding: '48px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(184, 134, 11, 0.1)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <Target size={32} />
          </div>
          <h2 style={{ fontSize: '28px', color: 'var(--text-main)', marginBottom: '16px' }}>{t('about.mission.title')}</h2>
          <p style={{ color: 'var(--muted)', fontSize: '16px', lineHeight: 1.7 }}>
            {t('about.mission.desc')}
          </p>
        </motion.div>

        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} transition={{ delay: 0.2 }}
          style={{ background: 'var(--bg-card)', padding: '48px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(194, 24, 91, 0.1)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <Lightbulb size={32} />
          </div>
          <h2 style={{ fontSize: '28px', color: 'var(--text-main)', marginBottom: '16px' }}>{t('about.vision.title')}</h2>
          <p style={{ color: 'var(--muted)', fontSize: '16px', lineHeight: 1.7 }}>
            {t('about.vision.desc')}
          </p>
        </motion.div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────────── */}
      <section style={{ background: 'var(--bg-dark)', padding: '80px 0', marginTop: '40px' }}>
        <div className="wrap">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="sec-eyebrow">{t('about.values.eyebrow')}</span>
            <h2 className="sec-title">{t('about.values.title')}</h2>
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            {[
              { icon: <Shield size={28} />, title: t('about.values.1.title'), desc: t('about.values.1.desc') },
              { icon: <Award size={28} />, title: t('about.values.2.title'), desc: t('about.values.2.desc') },
              { icon: <Globe2 size={28} />, title: t('about.values.3.title'), desc: t('about.values.3.desc') },
              { icon: <Users size={28} />, title: t('about.values.4.title'), desc: t('about.values.4.desc') }
            ].map((feature, i) => (
              <motion.div variants={fadeIn} key={i} style={{ padding: '32px', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', margin: '0 auto 20px', borderRadius: '14px', background: 'var(--gold)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <div style={{ background: 'var(--navy)', padding: '80px 0', marginTop: '40px' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {[
            { icon: <BookOpen size={32} />, val: '225+', label: t('about.stats.certifications') || 'Certifications' },
            { icon: <Users size={32} />, val: '10K+', label: t('about.stats.students') || 'Students Certified' },
            { icon: <Globe2 size={32} />, val: 'Pan-India', label: t('about.stats.presence') || 'Presence' }
          ].map((stat, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} transition={{ delay: i * 0.1 }}>
              <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(184, 134, 11, 0.1)', color: 'var(--gold)', marginBottom: '16px' }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '48px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{stat.val}</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <div className="wrap" style={{ textAlign: 'center', marginTop: '100px', padding: '60px', background: 'linear-gradient(135deg, var(--gold-light), #F5B041)', borderRadius: '32px', color: '#020b18' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '24px' }}>{t('about.cta.title')}</h2>
        <p style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto 32px', opacity: 0.9 }}>
          {t('about.cta.desc')}
        </p>
        <Link to="/courses" className="btn btn-lg" style={{ background: 'var(--navy)', color: '#fff', fontWeight: 700, padding: '16px 32px', border: 'none', boxShadow: '0 10px 30px rgba(13, 27, 62, 0.3)' }}>
          {t('about.cta.btn')}
        </Link>
      </div>

    </div>
  );
}
