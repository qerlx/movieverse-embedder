import { validateSeasonEpisode, validateMediaId, sanitizeUrlParams } from './api';

export interface VideoSource {
  id: string;
  name: string;
  getUrl: (type: string, id: string, season?: string, episode?: string, extraParams?: Record<string, any>) => string | null;
  fallbackOrder: number;
  supportsAnime?: boolean;
}

/**
 * ID Sanitization - Remove unsafe characters
 */
function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9-]/g, '');
}

/**
 * Detect and format anime IDs with proper prefixes
 */
function formatAnimeId(id: string): string {
  const sanitized = sanitizeId(id);
  
  // If already prefixed, return as-is
  if (sanitized.startsWith('ani') || sanitized.startsWith('imdb') || sanitized.startsWith('tmdb')) {
    return sanitized;
  }
  
  // If starts with 'tt' it's IMDb
  if (sanitized.startsWith('tt')) {
    return `imdb${sanitized}`;
  }
  
  // If numeric only, it's MAL (no prefix needed)
  if (/^\d+$/.test(sanitized)) {
    return sanitized;
  }
  
  // Default to AniList prefix for other formats
  return `ani${sanitized}`;
}

/**
 * Video sources configuration with security validations
 * Order: Movies/TV first, then Anime-specific sources
 */
export const videoSources: VideoSource[] = [
  {
    id: "vidsrc",
    name: "VidSrc HD",
    fallbackOrder: 1,
    getUrl: (type, id, season, episode, extraParams = {}) => {
      const mediaId = validateMediaId(id);
      if (!mediaId) return null;
      
      const version = extraParams.version || 'v2'; // v2 or v3
      
      if (type === "movie") {
        const baseUrl = `https://vidsrc.cc/${version}/embed/movie/${mediaId}`;
        const queryParams: Record<string, string> = {};
        if (extraParams.autoPlay !== undefined) queryParams.autoPlay = String(extraParams.autoPlay);
        
        const searchParams = new URLSearchParams(queryParams);
        return searchParams.toString() ? `${baseUrl}?${searchParams.toString()}` : baseUrl;
      } else if (type === "tv" && season && episode) {
        const validatedEpisode = validateSeasonEpisode(season, episode);
        if (!validatedEpisode) return null;
        
        const baseUrl = `https://vidsrc.cc/${version}/embed/tv/${mediaId}/${validatedEpisode.season}/${validatedEpisode.episode}`;
        const queryParams: Record<string, string> = {};
        if (extraParams.poster !== undefined) queryParams.poster = String(extraParams.poster);
        if (extraParams.autoPlay !== undefined) queryParams.autoPlay = String(extraParams.autoPlay);
        
        const searchParams = new URLSearchParams(queryParams);
        return searchParams.toString() ? `${baseUrl}?${searchParams.toString()}` : baseUrl;
      }
      
      return null;
    }
  },
  {
    id: "vidlink",
    name: "VidLink Pro",
    fallbackOrder: 2,
    supportsAnime: true,
    getUrl: (type, id, season, episode, extraParams = {}) => {
      const mediaId = validateMediaId(id);
      
      if (type === "movie") {
        if (!mediaId) return null;
        const baseUrl = `https://vidlink.pro/movie/${mediaId}`;
        
        // Add custom params
        const queryParams: Record<string, string> = {};
        if (extraParams.primaryColor) queryParams.primaryColor = sanitizeId(extraParams.primaryColor);
        if (extraParams.secondaryColor) queryParams.secondaryColor = sanitizeId(extraParams.secondaryColor);
        if (extraParams.iconColor) queryParams.iconColor = sanitizeId(extraParams.iconColor);
        if (extraParams.icons) queryParams.icons = String(extraParams.icons);
        if (extraParams.player) queryParams.player = String(extraParams.player);
        if (extraParams.nextButton) queryParams.nextButton = 'true';
        if (extraParams.startAt) queryParams.startAt = String(parseInt(extraParams.startAt, 10));
        
        const searchParams = new URLSearchParams(queryParams);
        return searchParams.toString() ? `${baseUrl}?${searchParams.toString()}` : baseUrl;
      } else if (type === "tv" && season && episode) {
        if (!mediaId) return null;
        const validatedEpisode = validateSeasonEpisode(season, episode);
        if (!validatedEpisode) return null;
        
        const baseUrl = `https://vidlink.pro/tv/${mediaId}/${validatedEpisode.season}/${validatedEpisode.episode}`;
        
        // Add custom params
        const queryParams: Record<string, string> = {};
        if (extraParams.primaryColor) queryParams.primaryColor = sanitizeId(extraParams.primaryColor);
        if (extraParams.nextButton) queryParams.nextButton = 'true';
        
        const searchParams = new URLSearchParams(queryParams);
        return searchParams.toString() ? `${baseUrl}?${searchParams.toString()}` : baseUrl;
      } else if (type === "anime") {
        // VidLink anime uses MAL ID (no prefix)
        const malId = sanitizeId(id);
        if (!malId) return null;
        
        const episodeNum = episode ? parseInt(episode, 10) : 1;
        const dubType = extraParams.dub ? 'dub' : 'sub';
        
        const baseUrl = `https://vidlink.pro/anime/${malId}/${episodeNum}/${dubType}`;
        
        const queryParams: Record<string, string> = {};
        if (extraParams.fallback) queryParams.fallback = 'true';
        
        const searchParams = new URLSearchParams(queryParams);
        return searchParams.toString() ? `${baseUrl}?${searchParams.toString()}` : baseUrl;
      }
      
      return null;
    }
  },
  {
    id: "autoembed",
    name: "AutoEmbed",
    fallbackOrder: 3,
    getUrl: (type, id, season, episode, extraParams = {}) => {
      const sanitizedId = sanitizeId(id);
      if (!sanitizedId) return null;
      
      // AutoEmbed prefers IMDb IDs (tt prefix)
      const formattedId = sanitizedId.startsWith('tt') ? sanitizedId : `tt${sanitizedId}`;
      
      if (type === "movie") {
        const baseUrl = `https://player.autoembed.cc/embed/movie/${formattedId}`;
        return baseUrl;
      } else if (type === "tv" && season && episode) {
        const validatedEpisode = validateSeasonEpisode(season, episode);
        if (!validatedEpisode) return null;
        
        const baseUrl = `https://player.autoembed.cc/embed/tv/${formattedId}/${validatedEpisode.season}/${validatedEpisode.episode}`;
        const queryParams: Record<string, string> = {};
        if (extraParams.server) queryParams.server = String(extraParams.server);
        
        const searchParams = new URLSearchParams(queryParams);
        return searchParams.toString() ? `${baseUrl}?${searchParams.toString()}` : baseUrl;
      }
      
      return null;
    }
  },
  {
    id: "vidsrc-anime",
    name: "Vidsrc Anime",
    fallbackOrder: 4,
    supportsAnime: true,
    getUrl: (type, id, season, episode, extraParams = {}) => {
      if (type !== "anime") return null;
      
      const animeId = formatAnimeId(id);
      const episodeNum = episode ? parseInt(episode, 10) : 1;
      const dubType = extraParams.dub ? 'dub' : 'sub';
      
      if (!episodeNum || episodeNum < 1) return null;
      
      const baseUrl = `https://vidsrc.cc/v2/embed/anime/${animeId}/${episodeNum}/${dubType}`;
      
      // Build query params
      const queryParams: Record<string, string> = {};
      if (extraParams.autoPlay) queryParams.autoPlay = 'true';
      if (extraParams.autoSkipIntro) queryParams.autoSkipIntro = 'true';
      
      const searchParams = new URLSearchParams(queryParams);
      return searchParams.toString() ? `${baseUrl}?${searchParams.toString()}` : baseUrl;
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
  
  // Return first source as default (VidSrc HD - supports movies/TV)
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
  episode?: string,
  extraParams?: Record<string, any>
): string | null {
  try {
    return source.getUrl(type, id, season, episode, extraParams);
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
      'vidsrc.cc',
      'player.autoembed.cc',
      'autoembed.cc',
      'vidlink.pro'
    ];
    
    return allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

/**
 * Setup VidLink progress tracking listener
 */
export function setupVidLinkProgressTracking(callback?: (mediaData: any) => void): () => void {
  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== 'https://vidlink.pro') return;

    if (event.data?.type === 'MEDIA_DATA') {
      const mediaData = event.data.data;
      
      // Store in localStorage
      try {
        localStorage.setItem('vidLinkProgress', JSON.stringify(mediaData));
      } catch (error) {
        console.error('Failed to save VidLink progress:', error);
      }
      
      // Call custom callback if provided
      if (callback) {
        callback(mediaData);
      }
    }
  };

  window.addEventListener('message', handleMessage);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('message', handleMessage);
  };
}
