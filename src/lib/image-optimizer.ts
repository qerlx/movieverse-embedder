// Image optimization utilities
export const createOptimizedImageUrl = (
  originalUrl: string,
  width?: number,
  quality?: number
): string => {
  if (!originalUrl) return '';
  
  // Handle TMDB images
  if (originalUrl.includes('image.tmdb.org')) {
    // Extract the file path
    const pathMatch = originalUrl.match(/\/t\/p\/[^/]+(.+)$/);
    if (pathMatch) {
      const filePath = pathMatch[1];
      const sizePrefix = width ? getOptimalTMDBSize(width) : 'w500';
      return `https://image.tmdb.org/t/p/${sizePrefix}${filePath}`;
    }
  }
  
  return originalUrl;
};

const getOptimalTMDBSize = (width: number): string => {
  if (width <= 92) return 'w92';
  if (width <= 154) return 'w154';
  if (width <= 185) return 'w185';
  if (width <= 342) return 'w342';
  if (width <= 500) return 'w500';
  if (width <= 780) return 'w780';
  return 'original';
};

// Preload critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Lazy loading intersection observer
let imageObserver: IntersectionObserver | null = null;

export const createImageObserver = (callback: (entry: IntersectionObserverEntry) => void) => {
  if (imageObserver) return imageObserver;
  
  imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(callback);
    },
    {
      rootMargin: '50px',
      threshold: 0.1,
    }
  );
  
  return imageObserver;
};

export const observeImage = (element: HTMLElement, callback: () => void) => {
  const observer = createImageObserver((entry) => {
    if (entry.isIntersecting) {
      callback();
      observer.unobserve(entry.target);
    }
  });
  
  observer.observe(element);
};