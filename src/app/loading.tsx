import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Loading() {
  return (
    <div className="min-h-screen bg-arena-dark flex items-center justify-center">
      <div className="w-full max-w-sm px-6 space-y-4">
        <Skeleton
          circle
          width={64}
          height={64}
          baseColor="var(--skeleton-base, #14161e)"
          highlightColor="var(--skeleton-highlight, #1e2030)"
        />
        <Skeleton
          width={180}
          height={16}
          borderRadius={8}
          baseColor="var(--skeleton-base, #14161e)"
          highlightColor="var(--skeleton-highlight, #1e2030)"
        />
        <Skeleton
          width={120}
          height={12}
          borderRadius={6}
          baseColor="var(--skeleton-base, #14161e)"
          highlightColor="var(--skeleton-highlight, #1e2030)"
        />
      </div>
    </div>
  );
}
