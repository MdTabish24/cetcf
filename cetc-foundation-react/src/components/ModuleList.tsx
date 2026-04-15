import type { ModuleSpec } from '../data/siteContent';

type ModuleListProps = {
  modules: ModuleSpec[];
};

function ModuleList({ modules }: ModuleListProps) {
  return (
    <div className="module-grid">
      {modules.map((module) => (
        <article key={module.id} className="module-card">
          <h3>{module.title}</h3>
          <ul>
            {module.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

export default ModuleList;
