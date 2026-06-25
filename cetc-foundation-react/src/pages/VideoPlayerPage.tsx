import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUser } from '../services/api';

export default function VideoPlayerPage() {
  const { tradeId } = useParams<{ tradeId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Mock playlist for demonstration since the backend `course_videos` table is empty
  const playlist = [
    { id: 1, title: 'Module 1: Introduction to the Course', duration: '15:20', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 2, title: 'Module 2: Core Concepts & Theory', duration: '45:10', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 3, title: 'Module 3: Practical Demonstration', duration: '30:05', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  ];

  const [activeVideo, setActiveVideo] = useState(playlist[0]);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      navigate('/');
      return;
    }
    
    // Here we would typically fetch the video list from `/api/candidates/videos/${tradeId}`
    // which verifies the user actually bought the video pathway for this course
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [navigate, tradeId]);

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', color: '#fff' }}>Loading Player...</div>;

  return (
    <section className="section" style={{ padding: '20px 0' }}>
      <div className="wrap-lg">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
          <Link to="/dashboard" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
            ← Back to Dashboard
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', alignItems: 'start' }}>
          {/* Main Player Area */}
          <div>
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
              <iframe 
                width="100%" 
                height="100%" 
                src={activeVideo.url} 
                title={activeVideo.title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            <h1 style={{ fontSize: '24px', color: '#fff', marginBottom: '12px' }}>{activeVideo.title}</h1>
            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6 }}>
              Watch this module carefully. The concepts covered here will be tested in your final certification exam.
            </p>
          </div>

          {/* Playlist Sidebar */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              Course Playlist
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {playlist.map((vid, idx) => (
                <button
                  key={vid.id}
                  onClick={() => setActiveVideo(vid)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '12px 16px',
                    background: activeVideo.id === vid.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                    border: `1px solid ${activeVideo.id === vid.id ? 'var(--gold)' : 'rgba(255,255,255,0.05)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: activeVideo.id === vid.id ? 700 : 400, color: activeVideo.id === vid.id ? 'var(--gold)' : '#fff', marginBottom: '4px' }}>
                    {idx + 1}. {vid.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{vid.duration}</div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>Finished watching all videos?</p>
              <Link to={`/exam?trade_id=${tradeId}`} className="btn btn-gold" style={{ width: '100%' }}>
                Take Final Exam
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
