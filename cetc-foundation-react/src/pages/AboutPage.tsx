import DataTable from '../components/DataTable';
import PageHero from '../components/PageHero';
import SectionIntro from '../components/SectionIntro';
import {
  architectureFlow,
  databaseTables,
  developerAllocation,
  milestones,
  organizationFacts,
  techStack,
} from '../data/siteContent';

function AboutPage() {
  return (
    <div className="page-stack">
      <PageHero
        eyebrow="Organization and Platform"
        title="About CETC Foundation and Technical Architecture"
        description="Institution profile, platform stack, system flow, database model, and engineering ownership structure is page me consolidated format me diya gaya hai."
        actions={[
          { label: 'Open Admin Controls', to: '/admin' },
          { label: 'View Contact', to: '/contact', tone: 'secondary' },
        ]}
      />

      <section className="surface-block">
        <SectionIntro
          eyebrow="Institution Credentials"
          title="Organization fact sheet"
          description="Section 8 company registration aur trust credentials foundation credibility ka base hain."
        />
        <div className="grid-two">
          <DataTable title="Organization Details" table={{ headers: ['Field', 'Value'], rows: organizationFacts }} />
          <DataTable title="3.1 Recommended Tech Stack" table={techStack} />
        </div>
      </section>

      <section className="surface-block">
        <SectionIntro
          eyebrow="3.2 System Architecture"
          title="Layered platform flow"
          description="Browser se APIs aur data services tak ka high-level processing sequence."
        />
        <div className="flow-grid">
          {architectureFlow.map((step) => (
            <div key={step} className="flow-node">
              {step}
            </div>
          ))}
        </div>
      </section>

      <section className="surface-block">
        <SectionIntro
          eyebrow="3.3 Database"
          title="Core data model"
          description="Candidate, exams, certificates, payments, commissions aur partners ke primary tables yahan listed hain."
        />
        <DataTable title="Main Database Tables" table={databaseTables} />
      </section>

      <section className="surface-block">
        <SectionIntro
          eyebrow="5.2 and 5.3 Project Delivery"
          title="Team ownership and milestone commitments"
          description="Development team responsibilities aur week-wise milestone deliverables execution planning ko support karte hain."
        />
        <div className="grid-two">
          <DataTable title="Developer Task Allocation" table={developerAllocation} />
          <DataTable title="Milestones and Deliverables" table={milestones} />
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
