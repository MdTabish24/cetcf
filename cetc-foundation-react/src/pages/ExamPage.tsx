import { examData } from '../data/mockupContent';

function ExamPage() {
  return (
    <div className="page">
      <section className="page-hero compact">
        <div className="breadcrumb">Home &gt; <span>Online Assessment</span></div>
        <h1>{examData.title}</h1>
        <p>{examData.meta}</p>
      </section>

      <section className="exam-layout">
        <aside className="exam-sidebar">
          <div className="timer-box">
            <div className="timer-label">Time Remaining</div>
            <div className="timer-val">{examData.timer}</div>
          </div>
          <div className="exam-subtitle">Question Navigator</div>
          <div className="q-grid">
            {examData.qDots.map((dot) => (
              <div key={dot.number} className={`q-dot ${dot.state}`}>{dot.number}</div>
            ))}
          </div>
          <div className="legend">
            <div className="leg-item"><span className="leg-dot answered" /> Answered (5)</div>
            <div className="leg-item"><span className="leg-dot skipped" /> Skipped (1)</div>
            <div className="leg-item"><span className="leg-dot current" /> Current</div>
            <div className="leg-item"><span className="leg-dot"> </span> Not visited (54)</div>
          </div>
          <button className="btn-primary danger" type="button">Submit Exam</button>
        </aside>

        <div className="exam-main">
          <div className="q-number">{examData.questionNumber}</div>
          <div className="q-text">{examData.questionText}</div>
          <div className="options">
            {examData.options.map((option) => (
              <div key={option.label} className={`option ${option.selected ? 'selected' : ''}`}>
                <div className="option-letter">{option.label}</div>
                {option.text}
              </div>
            ))}
          </div>
          <div className="exam-nav">
            <button className="btn-outline muted" type="button">&larr; Previous</button>
            <button className="btn-outline warn" type="button">Skip Question</button>
            <button className="btn-primary" type="button">Next Question &rarr;</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ExamPage;
