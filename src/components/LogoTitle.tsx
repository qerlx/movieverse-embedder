
import React, { useState, useEffect, memo } from 'react';
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

const LogoTitle: React.FC<LogoTitleProps> = memo(({ 
  id, 
  title, 
  type, 
  className = "w-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[350px] h-auto max-h-12 sm:max-h-14 md:max-h-16 lg:max-h-18 object-contain",
  fallbackClassName = "text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white text-center"
}) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchLogo = async () => {
      try {
        setIsLoading(true);
        setError(false);
        
        let imageData: ImageData;
        
        if (type === 'movie') {
          imageData = await fetchMovieImages(id);
        } else {
          imageData = await fetchTVShowImages(id);
        }
        
        if (!isMounted) return;
        
        // Find English logo first, fallback to any logo
        const englishLogo = imageData.logos?.find(logo => logo.iso_639_1 === 'en');
        const anyLogo = imageData.logos?.[0];
        const selectedLogo = englishLogo || anyLogo;
        
        if (selectedLogo) {
          setLogoUrl(`https://image.tmdb.org/t/p/w300${selectedLogo.file_path}`);
        }
      } catch (error) {
        console.error(`Error fetching ${type} logo:`, error);
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLogo();
    
    return () => {
      isMounted = false;
    };
  }, [id, type]);

  if (isLoading) {
    return (
      <div className={fallbackClassName}>
        {title}
      </div>
    );
  }

  if (error || !logoUrl) {
    return (
      <h1 className={fallbackClassName}>
        {title}
      </h1>
    );
  }

  return (
    <div className="flex justify-center items-center w-full">
      <img 
        src={logoUrl} 
        alt={title}
        className={className}
        style={{ 
          maxWidth: '100%',
          height: 'auto',
          objectFit: 'contain'
        }}
        onError={() => {
          setLogoUrl(null);
          setError(true);
        }}
        loading="lazy"
      />
    </div>
  );
});

LogoTitle.displayName = 'LogoTitle';

export default LogoTitle;
