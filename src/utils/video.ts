import { VIDORA_THEME_COLOR, VIDEO_PLAYER_SETTINGS } from '@/constants';
import { validateSeasonEpisode, validateMediaId, sanitizeUrlParams } from './api';

export interface VideoSource {
  id: string;
  name: string;
  getUrl: (type: string, id: string, season?: string, episode?: string) => string | null;
  fallbackOrder: number;
}

/**
 * Video sources configuration with security validations
 */
export const videoSources: VideoSource[] = [
  {
    id: "vidora",
    name: "Vidora Pro",
    fallbackOrder: 1,
    getUrl: (type, id, season, episode) => {
      const mediaId = validateMediaId(id);
      if (!mediaId) return null;
      
      let baseUrl: string;
      
      if (type === "movie") {
        baseUrl = `https://vidora.su/movie/${mediaId}`;
      } else if (type === "tv" && season && episode) {
        const validatedEpisode = validateSeasonEpisode(season, episode);
        if (!validatedEpisode) return null;
        
        baseUrl = `https://vidora.su/tv/${mediaId}/${validatedEpisode.season}/${validatedEpisode.episode}`;
      } else {
        return null;
      }
      
      // Build safe parameters
      const params = sanitizeUrlParams({
        autoplay: VIDEO_PLAYER_SETTINGS.autoplay,
        colour: VIDORA_THEME_COLOR,
        autonextepisode: type === "tv" ? VIDEO_PLAYER_SETTINGS.autonextepisode : false,
        backbutton: `${window.location.origin}/${type}/${mediaId}`,
        pausescreen: VIDEO_PLAYER_SETTINGS.pausescreen,
        logo: `${window.location.origin}/placeholder.svg`
      });
      
      const searchParams = new URLSearchParams(params);
      return `${baseUrl}?${searchParams.toString()}`;
    }
  },
  {
    id: "vidsrc",
    name: "VidSrc HD",
    fallbackOrder: 2,
    getUrl: (type, id, season, episode) => {
      const mediaId = validateMediaId(id);
      if (!mediaId) return null;
      
      if (type === "movie") {
        return `https://vidsrc.cc/v2/embed/movie/${mediaId}`;
      } else if (type === "tv" && season && episode) {
        const validatedEpisode = validateSeasonEpisode(season, episode);
        if (!validatedEpisode) return null;
        
        return `https://vidsrc.cc/v2/embed/tv/${mediaId}/${validatedEpisode.season}/${validatedEpisode.episode}`;
      }
      
      return null;
    }
  },
  {
    id: "vidsrcpro",
    name: "VidSrc Pro",
    fallbackOrder: 3,
    getUrl: (type, id, season, episode) => {
      const mediaId = validateMediaId(id);
      if (!mediaId) return null;
      
      if (type === "movie") {
        return `https://vidsrc.pro/embed/movie/${mediaId}`;
      } else if (type === "tv" && season && episode) {
        const validatedEpisode = validateSeasonEpisode(season, episode);
        if (!validatedEpisode) return null;
        
        return `https://vidsrc.pro/embed/tv/${mediaId}/${validatedEpisode.season}/${validatedEpisode.episode}`;
      }
      
      return null;
    }
  },
  {
    id: "embedsu",
    name: "EmbedSu",
    fallbackOrder: 4,
    getUrl: (type, id, season, episode) => {
      const mediaId = validateMediaId(id);
      if (!mediaId) return null;
      
      if (type === "movie") {
        return `https://embed.su/embed/movie/${mediaId}`;
      } else if (type === "tv" && season && episode) {
        const validatedEpisode = validateSeasonEpisode(season, episode);
        if (!validatedEpisode) return null;
        
        return `https://embed.su/embed/tv/${mediaId}/${validatedEpisode.season}/${validatedEpisode.episode}`;
      }
      
      return null;
    }
  }
];

/**
 * Get video source by ID with fallback
 */
export function getVideoSource(sourceId?: string): VideoSource {
  if (sourceId) {
    const source = videoSources.find(src => src.id === sourceId);
    if (source) return source;
  }
  
  // Return first source as default
  return videoSources[0];
}

/**
 * Get next fallback source
 */
export function getNextFallbackSource(currentSourceId: string): VideoSource | null {
  const currentSource = videoSources.find(src => src.id === currentSourceId);
  if (!currentSource) return videoSources[0];
  
  const nextSources = videoSources
    .filter(src => src.fallbackOrder > currentSource.fallbackOrder)
    .sort((a, b) => a.fallbackOrder - b.fallbackOrder);
  
  return nextSources[0] || null;
}

/**
 * Build video URL with validation
 */
export function buildVideoUrl(
  source: VideoSource, 
  type: string, 
  id: string, 
  season?: string, 
  episode?: string
): string | null {
  try {
    return source.getUrl(type, id, season, episode);
  } catch (error) {
    console.error('Error building video URL:', error);
    return null;
  }
}

/**
 * Validate domain for security
 */
export function isValidVideoSource(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const allowedDomains = [
      'vidora.su',
      'vidsrc.cc',
      'vidsrc.pro',
      'embed.su',
      'vidzee.wtf'
    ];
    
    return allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}