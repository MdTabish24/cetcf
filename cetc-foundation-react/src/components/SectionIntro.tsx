type SectionIntroProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

function SectionIntro({ eyebrow, title, description }: SectionIntroProps) {
  return (
    <header className="section-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description ? <p className="section-description">{description}</p> : null}
    </header>
  );
}

export default SectionIntro;
