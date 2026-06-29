import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, Calendar } from 'lucide-react';
import { COURSES, SECTORS } from '../data/courses';

export default function CertificationsPage() {
  const [searchParams] = useSearchParams();
  const initialSector = searchParams.get('sector') || '';

  const [search, setSearch] = useState('');
  const [activeSector, setActiveSector] = useState(initialSector);
  const [activeLevel, setActiveLevel] = useState('');

  const createDropEffect = (e: React.MouseEvent, sectorName: string) => {
    const emojis: Record<string, string[]> = {
      'Beauty & Lifestyle': ['💅', '💄', '💖', '✨'],
      'Digital & Information Technology': ['💻', '🌐', '🖥️', '📡'],
      'Electrical & Electronics Trades': ['⚡', '🔋', '🔌', '💡'],
      'Construction & Building Trades': ['🏗️', '🧱', '🔨', '🚧'],
      'Automobile & Motor Trades': ['🚗', '🔧', '🏎️', '⚙️'],
      'Food, Catering & Hospitality': ['🍔', '🍕', '🍳', '🍽️'],
      'Fashion, Tailoring & Textiles': ['👗', '🧵', '✂️', '🧥'],
      'Agriculture & Rural Livelihood': ['🌾', '🚜', '🌱', '🐄'],
      'Child Care & Domestic Services': ['👶', '🍼', '🧸', '🧹'],
      'Education & Early Childhood': ['📚', '🖍️', '🏫', '🍎'],
      'Media, Photography & Content Creation': ['📷', '🎥', '🎬', '📸'],
      'Spoken Languages & Communication': ['🗣️', '💬', '🌍', '🎙️'],
      'Business, Retail & Finance': ['💼', '📈', '💰', '📊'],
      'Sports, Fitness & Recreation': ['⚽', '🏋️', '🎾', '🏃'],
      'Handicrafts & Creative Arts': ['🎨', '🧶', '🖌️', '🏺'],
      'Plumbing, Sanitation & Water': ['🚿', '🚰', '🚽', '💧'],
      'Environmental & Green Skills': ['♻️', '🌍', '🌳', '☀️'],
      'Religious & Spiritual Education': ['🕉️', '☪️', '✝️', '🕊️'],
      'Security & Facility Management': ['🛡️', '👮', '🏢', '🔒'],
      'Advanced Beauty, Cosmetology & Aesthetics': ['💆', '🧴', '💄', '✨'],
      'Advanced IT, Programming & Technologies': ['💻', '🚀', '🧠', '⚙️'],
      'Apparel Design, Pattern Making & Garment Construction': ['✂️', '📏', '👗', '🧥'],
      'Wellness & Alternative Therapy': ['🧘', '🌿', '💆', '🍵']
    };

    const symbols = emojis[sectorName] || ['🎓', '✨', '⭐'];

    for (let i = 0; i < 15; i++) {
      const el = document.createElement('div');
      el.innerText = symbols[Math.floor(Math.random() * symbols.length)];
      el.style.position = 'fixed';
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      el.style.fontSize = `${Math.random() * 20 + 15}px`;
      el.style.pointerEvents = 'none';
      el.style.zIndex = '9999';
      el.style.transition = 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 3s ease-out';
      
      const x = (Math.random() - 0.5) * 300;
      const y = Math.random() * 400 + 150;
      const rot = (Math.random() - 0.5) * 360;

      document.body.appendChild(el);

      requestAnimationFrame(() => {
        el.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
        el.style.opacity = '0';
      });

      setTimeout(() => {
        el.remove();
      }, 3000);
    }
  };

  const filtered = useMemo(() => {
    return COURSES.filter((c) => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.sector.toLowerCase().includes(search.toLowerCase());
      const matchSector = !activeSector || c.sector === activeSector;
      const matchLevel = !activeLevel || c.level === activeLevel;
      return matchSearch && matchSector && matchLevel;
    });
  }, [search, activeSector, activeLevel]);

  return (
    <>
      {/* Page Hero */}
      <section className="page-hero" id="courses-hero">
        <div className="wrap">
          <span className="sec-eyebrow" style={{ color: 'var(--gold-light)' }}>Course Catalog</span>
          <h1>225+ Certifications Across <span style={{ color: 'var(--gold-light)' }}>23 Sectors</span></h1>
          <p className="page-hero-sub">
            Browse our complete range of government-recognized vocational certifications.
            Filter by sector, level, or search for a specific course.
          </p>
        </div>
      </section>
      <div className="gold-rule"></div>

      <section className="section" id="courses-list">
        <div className="wrap">
          {/* Search Bar */}
          <div className="search-bar" id="course-search">
            <span style={{ fontSize: '20px', display: 'flex' }}><Search size={20} /></span>
            <input
              type="text"
              placeholder="Search courses... (e.g., Beautician, Python, Electrician)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="course-search-input"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', fontSize: '16px', color: 'var(--muted)', display: 'flex' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Level Filters */}
          <div className="filter-pills" id="level-filters">
            <button
              className={`filter-pill ${!activeLevel ? 'active' : ''}`}
              onClick={() => setActiveLevel('')}
            >
              All Levels ({COURSES.length})
            </button>
            {['Foundation', 'Intermediate', 'Advanced'].map((level) => {
              const count = COURSES.filter(c => c.level === level).length;
              return (
                <button
                  key={level}
                  className={`filter-pill ${activeLevel === level ? 'active' : ''}`}
                  onClick={() => setActiveLevel(activeLevel === level ? '' : level)}
                >
                  {level} ({count})
                </button>
              );
            })}
          </div>

          <div className="page-layout">
            <aside className="sidebar-sticky" id="sector-filters">
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter by Sector</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  className={`filter-pill ${!activeSector ? 'active' : ''}`}
                  onClick={() => setActiveSector('')}
                  style={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%', borderRadius: '8px' }}
                >
                  All Sectors
                </button>
                {SECTORS.map((s) => (
                  <button
                    key={s.name}
                    className={`filter-pill ${activeSector === s.name ? 'active' : ''}`}
                    onClick={(e) => {
                      createDropEffect(e, s.name);
                      setActiveSector(activeSector === s.name ? '' : s.name);
                    }}
                    style={{ 
                      justifyContent: 'flex-start', 
                      textAlign: 'left', 
                      width: '100%', 
                      borderRadius: '8px',
                      ...(activeSector !== s.name ? { borderColor: `${s.color}30` } : {})
                    }}
                  >
                    <span style={{ minWidth: '16px', display: 'inline-block' }}>{s.icon}</span> 
                    <span style={{ flex: 1, whiteSpace: 'normal', fontSize: '13px', lineHeight: 1.4 }}>{s.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{s.count}</span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="main-content">
              {/* Results count */}
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                Showing <strong style={{ color: 'var(--text-main)' }}>{filtered.length}</strong> course{filtered.length !== 1 ? 's' : ''}
                {activeSector && <> in <strong style={{ color: 'var(--text-main)' }}>{activeSector}</strong></>}
                {activeLevel && <> · <strong style={{ color: 'var(--text-main)' }}>{activeLevel}</strong> level</>}
              </p>

          {/* Courses Grid */}
          {filtered.length > 0 ? (
            <div className="courses-grid">
              {filtered.map((course) => {
                const sectorMeta = SECTORS.find(s => s.name === course.sector);
                const color = sectorMeta?.color || '#0D1B3E';
                return (
                  <Link
                    to={`/courses/${course.slug}`}
                    key={course.sno}
                    className="course-card"
                    id={`course-${course.slug}`}
                  >
                    <div className="course-card-top" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}></div>
                    <div className="course-card-body">
                      <div className="course-card-sector" style={{ color }}>
                        {course.icon} {course.sector}
                      </div>
                      <h3 className="course-card-title">{course.name}</h3>
                      <div className="course-card-meta">
                        <span className="course-meta-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {course.duration}</span>
                        <span className={`badge badge-${course.level.toLowerCase()}`}>
                          {course.level}
                        </span>
                      </div>
                    </div>
                    <div className="course-card-footer">
                      <div className="course-fee">
                        ₹{course.fee.toLocaleString('en-IN')} <small>exam fee</small>
                      </div>
                      <span className="btn btn-sm btn-gold">View Details →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--muted)' }}><Search size={48} /></div>
              <h3 className="empty-title">No courses found</h3>
              <p className="empty-desc">Try adjusting your search or filters.</p>
            </div>
          )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
