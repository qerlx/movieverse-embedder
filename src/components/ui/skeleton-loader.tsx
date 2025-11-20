import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'card' | 'text' | 'avatar' | 'hero';
}

export const SkeletonLoader = ({ className, variant = 'card' }: SkeletonLoaderProps) => {
  const variants = {
    card: "h-64 w-full rounded-lg",
    text: "h-4 w-full rounded",
    avatar: "h-12 w-12 rounded-full",
    hero: "h-96 w-full rounded-lg"
  };

  return (
    <div 
      className={cn(
        "animate-pulse bg-muted/50 backdrop-blur-sm",
        variants[variant],
        className
      )}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const SkeletonMovieCard = () => (
  <div className="space-y-3">
    <SkeletonLoader variant="card" />
    <SkeletonLoader variant="text" className="w-3/4" />
    <SkeletonLoader variant="text" className="w-1/2" />
  </div>
);

export const SkeletonHero = () => (
  <div className="space-y-4">
    <SkeletonLoader variant="hero" />
    <div className="space-y-2">
      <SkeletonLoader variant="text" className="w-1/2" />
      <SkeletonLoader variant="text" className="w-3/4" />
      <SkeletonLoader variant="text" className="w-2/3" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonMovieCard key={i} />
    ))}
  </div>
);
