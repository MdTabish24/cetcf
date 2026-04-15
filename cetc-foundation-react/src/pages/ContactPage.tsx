import DataTable from '../components/DataTable';
import PageHero from '../components/PageHero';
import SectionIntro from '../components/SectionIntro';
import { budgetSummary, contactDetails, contentRequirements } from '../data/siteContent';

function ContactPage() {
  return (
    <div className="page-stack">
      <PageHero
        eyebrow="Contact and Readiness"
        title="Pre-launch content and business readiness"
        description="Development start karne se pehle required content assets, policy pages, and communication readiness is page par consolidated hain."
        actions={[
          { label: 'Go to Partner Page', to: '/partner' },
          { label: 'Back to Home', to: '/', tone: 'secondary' },
        ]}
      />

      <section className="card-grid" aria-label="Contact details">
        {contactDetails.map(([label, value]) => (
          <article key={label} className="metric-card">
            <p>{label}</p>
            <h3>{value}</h3>
          </article>
        ))}
      </section>

      <section className="surface-block">
        <SectionIntro
          eyebrow="9.1 Content Requirements"
          title="Mandatory content package before development"
          description="Is checklist ko complete kiye bina enterprise-grade rollout ko stable tareeke se launch karna risky hoga."
        />
        <article className="module-card">
          <ul>
            {contentRequirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="surface-block">
        <SectionIntro
          eyebrow="10. Budget Summary"
          title="Financial planning baseline"
          description="One-time and recurring costs ko clear financial band me define kiya gaya hai."
        />
        <DataTable title="Cost and Revenue Summary" table={budgetSummary} />
      </section>
    </div>
  );
}

export default ContactPage;
