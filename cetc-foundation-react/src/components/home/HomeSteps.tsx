import { steps } from '../../data/mockupContent';

function HomeSteps() {
  return (
    <section className="section section-alt section-premium">
      <div className="section-header split-header">
        <div className="section-title">Certification kaise milti hai?</div>
        <div className="section-sub">Sirf 3 simple steps mein apna official certificate payein</div>
      </div>
      <div className="steps-track" />
      <div className="steps steps-lifted">
        {steps.map((step, index) => (
          <div key={step.title} className="step">
            <div className="step-num">{step.number}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
            {index < steps.length - 1 ? <span className="step-connector">&rarr;</span> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export default HomeSteps;
