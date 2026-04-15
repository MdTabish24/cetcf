import { Link } from 'react-router-dom';

type HeroAction = {
  label: string;
  to: string;
  tone?: 'primary' | 'secondary';
};

type HeroPanelItem = {
  label: string;
  value: string;
};

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: HeroAction[];
  panelTitle?: string;
  panelItems?: HeroPanelItem[];
};

function PageHero({ eyebrow, title, description, actions, panelTitle, panelItems }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="page-hero-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="hero-description">{description}</p>
        {actions?.length ? (
          <div className="hero-actions">
            {actions.map((action) => (
              <Link
                key={`${action.label}-${action.to}`}
                to={action.to}
                className={`btn ${action.tone === 'secondary' ? 'btn-secondary' : 'btn-primary'}`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      {panelTitle && panelItems?.length ? (
        <aside className="hero-panel">
          <h2>{panelTitle}</h2>
          <ul>
            {panelItems.map((item) => (
              <li key={`${item.label}-${item.value}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </section>
  );
}

export default PageHero;
