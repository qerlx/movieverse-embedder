
import React, { useState, useEffect } from 'react';
import { fetchMovieImages, fetchTVShowImages } from '@/lib/api';

interface LogoTitleProps {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  className?: string;
  fallbackClassName?: string;
}

interface ImageData {
  logos: Array<{
    file_path: string;
    iso_639_1: string | null;
    width: number;
    height: number;
  }>;
}

const LogoTitle: React.FC<LogoTitleProps> = ({ 
  id, 
  title, 
  type, 
  className = "max-w-xs sm:max-w-sm md:max-w-md max-h-12 sm:max-h-16 md:max-h-20 object-contain",
  fallbackClassName = "text-xl sm:text-2xl md:text-3xl font-bold text-white"
}) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        let imageData: ImageData;
        
        if (type === 'movie') {
          imageData = await fetchMovieImages(id);
        } else {
          imageData = await fetchTVShowImages(id);
        }
        
        // Find the best logo - prefer English, then any logo, prioritize by size
        const englishLogos = imageData.logos?.filter(logo => logo.iso_639_1 === 'en') || [];
        const allLogos = imageData.logos || [];
        
        // Sort by width (larger logos usually look better)
        const sortedEnglishLogos = englishLogos.sort((a, b) => b.width - a.width);
        const sortedAllLogos = allLogos.sort((a, b) => b.width - a.width);
        
        const selectedLogo = sortedEnglishLogos[0] || sortedAllLogos[0];
        
        if (selectedLogo) {
          // Use w500 for better quality
          setLogoUrl(`https://image.tmdb.org/t/p/w500${selectedLogo.file_path}`);
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error(`Error fetching ${type} logo:`, error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogo();
  }, [id, type]);

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className={`bg-white/20 rounded ${className}`} style={{ minHeight: '2rem' }} />
      </div>
    );
  }

  // Logo available and loaded successfully
  if (logoUrl && !hasError) {
    return (
      <img 
        src={logoUrl} 
        alt={title}
        className={`${className} filter drop-shadow-lg`}
        onError={() => {
          console.log(`Logo failed to load for ${title}, falling back to text`);
          setHasError(true);
          setLogoUrl(null);
        }}
        onLoad={() => {
          console.log(`Logo loaded successfully for ${title}`);
        }}
      />
    );
  }

  // Fallback to text title
  return (
    <h1 className={`${fallbackClassName} drop-shadow-lg`}>
      {title}
    </h1>
  );
};

export default LogoTitle;
