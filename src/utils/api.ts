/**
 * Safe API fetch utility with error handling and abort controller support
 */
export async function safeFetch<T>(
  url: string, 
  options: RequestInit & { timeout?: number } = {}
): Promise<T | null> {
  const { timeout = 10000, ...fetchOptions } = options;
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Basic validation - ensure we got some data
    if (data === null || data === undefined) {
      throw new Error('No data received from API');
    }
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('API request timed out:', url);
      } else {
        console.error('API Error:', error.message, 'URL:', url);
      }
    } else {
      console.error('Unknown API error:', error, 'URL:', url);
    }
    
    return null;
  }
}

/**
 * Validate and sanitize URL parameters
 */
export function sanitizeUrlParams(params: Record<string, any>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      // Convert to string and encode
      sanitized[key] = encodeURIComponent(String(value));
    }
  }
  
  return sanitized;
}

/**
 * Build URL with validated parameters
 */
export function buildUrl(baseUrl: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }
  
  const sanitizedParams = sanitizeUrlParams(params);
  const searchParams = new URLSearchParams(sanitizedParams);
  
  return `${baseUrl}?${searchParams.toString()}`;
}

/**
 * Validate season and episode numbers
 */
export function validateSeasonEpisode(season: any, episode: any): { 
  season: number; 
  episode: number; 
} | null {
  const seasonNum = parseInt(String(season), 10);
  const episodeNum = parseInt(String(episode), 10);
  
  if (
    !Number.isInteger(seasonNum) || 
    !Number.isInteger(episodeNum) ||
    seasonNum < 1 || 
    episodeNum < 1 ||
    seasonNum > 100 || // Reasonable upper limit
    episodeNum > 1000  // Reasonable upper limit
  ) {
    return null;
  }
  
  return { season: seasonNum, episode: episodeNum };
}

/**
 * Sanitize text content to prevent XSS
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize media ID
 */
export function validateMediaId(id: any): number | null {
  const numericId = parseInt(String(id), 10);
  
  if (!Number.isInteger(numericId) || numericId < 1 || numericId > 10000000) {
    return null;
  }
  
  return numericId;
}