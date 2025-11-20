// API caching utilities for better performance
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
}

export const createCacheKey = (...parts: (string | number)[]): string => {
  return parts.join(':');
};

export const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now > cached.timestamp + cached.ttl) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

export const setCachedData = <T>(key: string, data: T, options: CacheOptions = {}): void => {
  const ttl = options.ttl || 1000 * 60 * 5; // Default 5 minutes for better freshness
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

export const clearCache = (pattern?: string): void => {
  if (!pattern) {
    cache.clear();
    return;
  }
  
  const regex = new RegExp(pattern);
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
};

// Cache size management
export const getCacheSize = (): number => cache.size;

export const pruneCacheIfNeeded = (maxSize = 100): void => {
  if (cache.size <= maxSize) return;
  
  // Remove oldest entries first
  const entries = Array.from(cache.entries())
    .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
  const toRemove = entries.slice(0, cache.size - maxSize);
  toRemove.forEach(([key]) => cache.delete(key));
};