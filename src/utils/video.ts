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
    name: "VidSrc",
    fallbackOrder: 1,
    getUrl: (type, id, season, episode) => {
      const mediaId = validateMediaId(id);
      if (!mediaId) return null;
      
      if (type === "movie") {
        return `https://vidsrc.xyz/embed/movie/${mediaId}`;
      } else if (type === "tv" && season && episode) {
        const validatedEpisode = validateSeasonEpisode(season, episode);
        if (!validatedEpisode) return null;
        return `https://vidsrc.xyz/embed/tv/${mediaId}/${validatedEpisode.season}/${validatedEpisode.episode}`;
      }
      return null;
    }
  },
  {
    id: "superembed",
    name: "SuperEmbed",
    fallbackOrder: 2,
    getUrl: (type, id, season, episode) => {
      const mediaId = validateMediaId(id);
      if (!mediaId) return null;
      
      if (type === "movie") {
        return `https://multiembed.mov/?video_id=${mediaId}&tmdb=1`;
      } else if (type === "tv" && season && episode) {
        const validatedEpisode = validateSeasonEpisode(season, episode);
        if (!validatedEpisode) return null;
        return `https://multiembed.mov/?video_id=${mediaId}&tmdb=1&s=${validatedEpisode.season}&e=${validatedEpisode.episode}`;
      }
      return null;
    }
  },
  {
    id: "moviesapi",
    name: "MoviesAPI",
    fallbackOrder: 3,
    getUrl: (type, id, season, episode) => {
      const mediaId = validateMediaId(id);
      if (!mediaId) return null;
      
      if (type === "movie") {
        return `https://moviesapi.club/movie/${mediaId}`;
      } else if (type === "tv" && season && episode) {
        const validatedEpisode = validateSeasonEpisode(season, episode);
        if (!validatedEpisode) return null;
        return `https://moviesapi.club/tv/${mediaId}-${validatedEpisode.season}-${validatedEpisode.episode}`;
      }
      return null;
    }
  },
  {
    id: "autoembed",
    name: "AutoEmbed",
    fallbackOrder: 4,
    getUrl: (type, id, season, episode) => {
      const mediaId = validateMediaId(id);
      if (!mediaId) return null;
      
      if (type === "movie") {
        return `https://player.autoembed.cc/embed/movie/${mediaId}`;
      } else if (type === "tv" && season && episode) {
        const validatedEpisode = validateSeasonEpisode(season, episode);
        if (!validatedEpisode) return null;
        return `https://player.autoembed.cc/embed/tv/${mediaId}/${validatedEpisode.season}/${validatedEpisode.episode}`;
      }
      return null;
    }
  },
  {
    id: "smashystream",
    name: "Smashystream",
    fallbackOrder: 5,
    getUrl: (type, id, season, episode) => {
      const mediaId = validateMediaId(id);
      if (!mediaId) return null;
      
      if (type === "movie") {
        return `https://player.smashy.stream/movie/${mediaId}`;
      } else if (type === "tv" && season && episode) {
        const validatedEpisode = validateSeasonEpisode(season, episode);
        if (!validatedEpisode) return null;
        return `https://player.smashy.stream/tv/${mediaId}/${validatedEpisode.season}/${validatedEpisode.episode}`;
      }
      return null;
    }
  },
  {
    id: "vikingembed",
    name: "VikingEmbed",
    fallbackOrder: 6,
    getUrl: (type, id, season, episode) => {
      const mediaId = validateMediaId(id);
      if (!mediaId) return null;
      
      if (type === "movie") {
        return `https://vembed.online/play/${mediaId}?type=movie`;
      } else if (type === "tv" && season && episode) {
        const validatedEpisode = validateSeasonEpisode(season, episode);
        if (!validatedEpisode) return null;
        return `https://vembed.online/play/${mediaId}?type=tv&s=${validatedEpisode.season}&e=${validatedEpisode.episode}`;
      }
      return null;
    }
  },
  {
    id: "vidapi",
    name: "VidAPI",
    fallbackOrder: 7,
    getUrl: (type, id, season, episode) => {
      const mediaId = validateMediaId(id);
      if (!mediaId) return null;
      
      if (type === "movie") {
        return `https://vidapi.xyz/embed/movie/${mediaId}`;
      } else if (type === "tv" && season && episode) {
        const validatedEpisode = validateSeasonEpisode(season, episode);
        if (!validatedEpisode) return null;
        return `https://vidapi.xyz/embed/tv/${mediaId}/${validatedEpisode.season}/${validatedEpisode.episode}`;
      }
      return null;
    }
  },
  {
    id: "rivestream",
    name: "Rive Stream",
    fallbackOrder: 8,
    getUrl: (type, id, season, episode) => {
      const mediaId = validateMediaId(id);
      if (!mediaId) return null;
      
      if (type === "movie") {
        return `https://rivestream.org/embed?type=movie&id=${mediaId}`;
      } else if (type === "tv" && season && episode) {
        const validatedEpisode = validateSeasonEpisode(season, episode);
        if (!validatedEpisode) return null;
        return `https://rivestream.org/embed?type=tv&id=${mediaId}&season=${validatedEpisode.season}&episode=${validatedEpisode.episode}`;
      }
      return null;
    }
  },
  {
    id: "anyembed",
    name: "Anyembed",
    fallbackOrder: 9,
    getUrl: (type, id, season, episode) => {
      const mediaId = validateMediaId(id);
      if (!mediaId) return null;
      
      if (type === "movie") {
        return `https://anyembed.xyz/movie/${mediaId}`;
      } else if (type === "tv" && season && episode) {
        const validatedEpisode = validateSeasonEpisode(season, episode);
        if (!validatedEpisode) return null;
        return `https://anyembed.xyz/tv/${mediaId}/${validatedEpisode.season}/${validatedEpisode.episode}`;
      }
      return null;
    }
  },
  {
    id: "embedmaster",
    name: "EmbedMaster",
    fallbackOrder: 10,
    getUrl: (type, id, season, episode) => {
      const mediaId = validateMediaId(id);
      if (!mediaId) return null;
      
      if (type === "movie") {
        return `https://embedmaster.com/embed/movie/${mediaId}`;
      } else if (type === "tv" && season && episode) {
        const validatedEpisode = validateSeasonEpisode(season, episode);
        if (!validatedEpisode) return null;
        return `https://embedmaster.com/embed/tv/${mediaId}/${validatedEpisode.season}/${validatedEpisode.episode}`;
      }
      return null;
    }
  },
  {
    id: "multiembed",
    name: "MultiEmbed",
    fallbackOrder: 11,
    getUrl: (type, id, season, episode) => {
      const mediaId = validateMediaId(id);
      if (!mediaId) return null;
      
      if (type === "movie") {
        return `https://multiembed.mov/directstream.php?video_id=${mediaId}&tmdb=1`;
      } else if (type === "tv" && season && episode) {
        const validatedEpisode = validateSeasonEpisode(season, episode);
        if (!validatedEpisode) return null;
        return `https://multiembed.mov/directstream.php?video_id=${mediaId}&tmdb=1&s=${validatedEpisode.season}&e=${validatedEpisode.episode}`;
      }
      return null;
    }
  },
  {
    id: "vidsrc-anime",
    name: "Vidsrc Anime",
    fallbackOrder: 12,
    supportsAnime: true,
    getUrl: (type, id, season, episode, extraParams = {}) => {
      if (type !== "anime") return null;
      
      const animeId = formatAnimeId(id);
      const episodeNum = episode ? parseInt(episode, 10) : 1;
      const dubType = extraParams.dub ? 'dub' : 'sub';
      
      if (!episodeNum || episodeNum < 1) return null;
      
      return `https://vidsrc.cc/v2/embed/anime/${animeId}/${episodeNum}/${dubType}`;
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
      'vidsrc.xyz',
      'vidsrc.cc',
      'multiembed.mov',
      'moviesapi.club',
      'player.autoembed.cc',
      'autoembed.cc',
      'player.smashy.stream',
      'smashy.stream',
      'vembed.online',
      'vidapi.xyz',
      'rivestream.org',
      'anyembed.xyz',
      'embedmaster.com',
      'superembed.stream'
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
