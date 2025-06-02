
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
  className = "w-full max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] h-auto max-h-12 sm:max-h-16 md:max-h-20 lg:max-h-24 object-contain mb-2",
  fallbackClassName = "text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2"
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
        style={{ 
          maxWidth: '100%',
          height: 'auto',
          objectFit: 'contain'
        }}
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
