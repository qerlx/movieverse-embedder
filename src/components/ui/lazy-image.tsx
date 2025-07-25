import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { createOptimizedImageUrl, observeImage } from '@/lib/image-optimizer';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  quality?: number;
  fallback?: string;
  className?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  quality,
  fallback = '/placeholder.svg',
  className,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const element = imgRef.current;
    observeImage(element, () => {
      setIsInView(true);
    });
  }, []);

  const optimizedSrc = createOptimizedImageUrl(src, width, quality);
  const displaySrc = hasError ? fallback : optimizedSrc;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
      <img
        ref={imgRef}
        src={isInView ? displaySrc : undefined}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        {...props}
      />
    </div>
  );
};