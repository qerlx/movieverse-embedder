
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
  }>;
}

const LogoTitle: React.FC<LogoTitleProps> = ({ 
  id, 
  title, 
  type, 
  className = "max-w-xs sm:max-w-sm md:max-w-md max-h-16 sm:max-h-20 md:max-h-24 object-contain mb-2",
  fallbackClassName = "text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2"
}) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setIsLoading(true);
        let imageData: ImageData;
        
        if (type === 'movie') {
          imageData = await fetchMovieImages(id);
        } else {
          imageData = await fetchTVShowImages(id);
        }
        
        // Find English logo first, fallback to any logo
        const englishLogo = imageData.logos?.find(logo => logo.iso_639_1 === 'en');
        const anyLogo = imageData.logos?.[0];
        const selectedLogo = englishLogo || anyLogo;
        
        if (selectedLogo) {
          setLogoUrl(`https://image.tmdb.org/t/p/w500${selectedLogo.file_path}`);
        }
      } catch (error) {
        console.error(`Error fetching ${type} logo:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogo();
  }, [id, type]);

  if (isLoading) {
    return (
      <div className={fallbackClassName}>
        {title}
      </div>
    );
  }

  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt={title}
        className={className}
        onError={() => setLogoUrl(null)}
      />
    );
  }

  // Fallback to text title
  return (
    <h1 className={fallbackClassName}>
      {title}
    </h1>
  );
};

export default LogoTitle;
