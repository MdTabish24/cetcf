import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="surface-block not-found">
      <p className="eyebrow">404</p>
      <h1>Requested page not found</h1>
      <p>The route you opened does not exist in this website map.</p>
      <Link className="btn btn-primary" to="/">
        Return to Home
      </Link>
    </section>
  );
}

export default NotFoundPage;
