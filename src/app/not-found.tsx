import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-arena-dark flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-8xl font-black text-arena-accent/20 mb-4">404</p>
        <h1 className="text-2xl font-bold text-arena-text-primary mb-2">Page Not Found</h1>
        <p className="text-arena-text-secondary text-sm mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
