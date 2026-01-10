import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export default function NotFound() {
  return (
    <>
      <SEO title="404 - Page Not Found" description="The page you're looking for doesn't exist" />

      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center px-6">
          <h1 className="text-8xl font-bold text-white mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-zinc-50 mb-4">Page Not Found</h2>
          <p className="text-lg text-zinc-400 mb-8">The page you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white text-black px-8 font-medium transition-colors hover:bg-zinc-200"
          >
            Go Home
          </Link>
        </div>
      </div>
    </>
  );
}
