import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export default function NotFound() {
  return (
    <>
      <SEO title="404 - Page Not Found" description="The page you're looking for doesn't exist" />

      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
        <h2>Page Not Found</h2>
        <p style={{ color: '#666', margin: '1rem 0 2rem' }}>
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: '#646cff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            transition: 'background 0.3s',
          }}
        >
          Go Home
        </Link>
      </div>
    </>
  );
}
