import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

interface Props {
  courseSlug: string;
}

export default function SyllabusBookViewer({ courseSlug }: Props) {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/html_books/${courseSlug}.html`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        // Extract body elements ignoring the container div if it exists just to get pure content
        const container = doc.querySelector('.container') || doc.body;
        const bodyContent = container.innerHTML;
        
        // Scope the styles so we don't bleed into the main app
        const scopedHtml = `
          <style>
            .book-content-wrapper {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #333;
              font-size: 15px;
            }
            .book-content-wrapper h1 { 
              color: var(--navy); 
              border-bottom: 2px solid var(--gold); 
              padding-bottom: 10px; 
              margin-bottom: 20px; 
              text-align: center; 
              font-size: 28px;
            }
            .book-content-wrapper h2 { 
              color: var(--navy); 
              border-bottom: 1px solid #eee; 
              padding-bottom: 5px; 
              margin-top: 20px; 
              font-size: 20px;
            }
            .book-content-wrapper h3 {
              color: #34495e;
              font-size: 18px;
            }
            .book-content-wrapper .meta-info { 
              display: flex; 
              justify-content: space-between; 
              background: #f8fafc; 
              padding: 15px; 
              border-radius: 8px; 
              margin-bottom: 20px; 
              font-weight: 600; 
              flex-wrap: wrap; 
              gap: 10px; 
              border: 1px solid #e2e8f0;
            }
            .book-content-wrapper .module { 
              background: #fff; 
              border: 1px solid #e2e8f0; 
              padding: 20px; 
              margin-bottom: 20px; 
              border-radius: 8px; 
              border-left: 4px solid var(--gold); 
              break-inside: avoid;
              box-shadow: 0 2px 5px rgba(0,0,0,0.02);
            }
            .book-content-wrapper .career-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); 
              gap: 15px; 
              margin-top: 20px; 
            }
            .book-content-wrapper .career-card { 
              background: #f8fafc; 
              border: 1px solid #e2e8f0; 
              padding: 15px; 
              border-radius: 8px; 
              text-align: center; 
              break-inside: avoid; 
            }
            .book-content-wrapper .assessment-box { 
              background: #f0fdf4; 
              border: 1px solid #bbf7d0;
              padding: 20px; 
              border-radius: 8px; 
              margin-top: 20px; 
              break-inside: avoid; 
            }
            .book-content-wrapper ul { padding-left: 20px; }
            .book-content-wrapper p { margin-bottom: 15px; line-height: 1.6; }
            
            /* Hide the default h1 if it's redundant */
            .book-content-wrapper > h1:first-child { display: none; }
          </style>
          <div class="book-content-wrapper">
            ${bodyContent}
          </div>
        `;
        setHtmlContent(scopedHtml);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [courseSlug]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const updatePages = () => {
        if (containerRef.current) {
          const scrollW = containerRef.current.scrollWidth;
          const clientW = containerRef.current.clientWidth;
          // Calculate total pages based on how many views we need
          // Add 10px buffer to prevent rounding issues
          setTotalPages(Math.max(1, Math.ceil((scrollW - 10) / clientW)));
        }
      };
      
      // Delay slightly to let the browser render and compute columns
      const timer = setTimeout(updatePages, 300);
      window.addEventListener('resize', updatePages);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updatePages);
      };
    }
  }, [loading, htmlContent]);

  const nextPage = () => {
    if (containerRef.current && currentPage < totalPages - 1) {
      const next = currentPage + 1;
      setCurrentPage(next);
      containerRef.current.scrollTo({
        left: next * containerRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };

  const prevPage = () => {
    if (containerRef.current && currentPage > 0) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      containerRef.current.scrollTo({
        left: prev * containerRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <BookOpen size={48} color="var(--muted)" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Detailed Syllabus Unavailable</h3>
        <p style={{ color: 'var(--muted)' }}>The complete syllabus book for this course is currently being updated.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: '8px', 
      boxShadow: '0 10px 40px rgba(0,0,0,0.08), inset 0 0 20px rgba(0,0,0,0.02)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      position: 'relative',
      padding: '30px 0 20px'
    }}>
      {/* Book Binding/Spine effect in the middle */}
      <div style={{ 
        position: 'absolute', 
        left: '50%', 
        top: 0, 
        bottom: 0, 
        width: '60px', 
        marginLeft: '-30px', 
        background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0.04) 50%, rgba(255,255,255,0) 100%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* Viewer Container */}
      <div 
        ref={containerRef}
        className="book-container-scroll"
        style={{
          height: '600px',
          padding: '0 40px',
          overflow: 'hidden',
          columnCount: 2,
          columnGap: '80px',
          columnFill: 'auto',
          scrollBehavior: 'smooth',
          position: 'relative',
        }}
        dangerouslySetInnerHTML={{ __html: htmlContent || '' }}
      />
      
      {/* Hide horizontal scrollbar but allow JS scrolling */}
      <style>{`
        .book-container-scroll::-webkit-scrollbar { display: none; }
        .book-container-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 768px) {
          .book-container-scroll { column-count: 1 !important; }
        }
      `}</style>

      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 40px 0', 
        borderTop: '1px solid #f1f5f9',
        background: '#fff',
        marginTop: '20px'
      }}>
        <button 
          onClick={prevPage}
          disabled={currentPage === 0}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '10px 20px', borderRadius: '20px', 
            background: currentPage === 0 ? '#f1f5f9' : 'var(--navy)', 
            color: currentPage === 0 ? '#94a3b8' : '#fff',
            border: 'none', cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 600, transition: 'all 0.2s'
          }}
        >
          <ChevronLeft size={20} /> Previous
        </button>
        
        <div style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '14px' }}>
          Page {currentPage + 1} of {totalPages}
        </div>

        <button 
          onClick={nextPage}
          disabled={currentPage >= totalPages - 1}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '10px 20px', borderRadius: '20px', 
            background: currentPage >= totalPages - 1 ? '#f1f5f9' : 'var(--navy)', 
            color: currentPage >= totalPages - 1 ? '#94a3b8' : '#fff',
            border: 'none', cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
            fontWeight: 600, transition: 'all 0.2s'
          }}
        >
          Next <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
