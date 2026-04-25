'use client';

import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const handleReset = () => {
    // Try the Next.js reset first
    try {
      reset();
    } catch {
      // If reset fails, force a full page reload
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    // Navigate to landing page to reset state
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-arena-dark flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-arena-accent/10 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-arena-accent" />
        </div>
        <h1 className="text-2xl font-bold text-arena-text-primary mb-2">
          Something went wrong
        </h1>
        <p className="text-arena-text-secondary text-sm mb-2">
          {error.message || 'An unexpected error occurred'}
        </p>
        {error.digest && (
          <p className="text-[10px] text-arena-text-muted mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        {!error.digest && <div className="mb-6" />}
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 px-5 py-2.5 bg-arena-card border border-arena-border text-arena-text-primary font-medium rounded-xl hover:border-arena-accent/30 transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
