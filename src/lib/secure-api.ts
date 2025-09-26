import { supabase } from "@/integrations/supabase/client";
import { getCachedData, setCachedData, createCacheKey } from "./api-cache";

// Secure API service that uses Supabase edge functions to proxy TMDB requests
export class SecureAPIService {
  private static instance: SecureAPIService;
  private requestQueue: Map<string, Promise<any>> = new Map();

  static getInstance(): SecureAPIService {
    if (!SecureAPIService.instance) {
      SecureAPIService.instance = new SecureAPIService();
    }
    return SecureAPIService.instance;
  }

  // Deduplicate simultaneous requests
  private async makeRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key);
    }

    const promise = requestFn().finally(() => {
      this.requestQueue.delete(key);
    });

    this.requestQueue.set(key, promise);
    return promise;
  }

  // Secure TMDB API call via Supabase edge function
  private async callTMDBAPI(path: string, params?: Record<string, any>) {
    const { data, error } = await supabase.functions.invoke('tmdb-proxy', {
      body: { path, params }
    });

    if (error) {
      throw new Error(`API call failed: ${error.message}`);
    }

    return data;
  }

  // Get trending content
  async getTrendingContent(mediaType: 'movie' | 'tv' | 'all', timeWindow: 'day' | 'week' = 'week') {
    const cacheKey = createCacheKey('trending', mediaType, timeWindow);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest(cacheKey, () =>
      this.callTMDBAPI(`trending/${mediaType}/${timeWindow}`)
    );

    if (data) {
      setCachedData(cacheKey, data, { ttl: 1000 * 60 * 30 });
    }

    return data;
  }

  // Search content
  async searchContent(query: string, page = 1) {
    const cacheKey = createCacheKey('search', query, page);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest(cacheKey, () =>
      this.callTMDBAPI('search/multi', { query, page })
    );

    if (data) {
      setCachedData(cacheKey, data, { ttl: 1000 * 60 * 10 });
    }

    return data;
  }

  // Get movie details
  async getMovieDetails(id: number) {
    const cacheKey = createCacheKey('movie', id);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest(cacheKey, () =>
      this.callTMDBAPI(`movie/${id}`, {
        append_to_response: 'videos,credits,similar,recommendations'
      })
    );

    if (data) {
      setCachedData(cacheKey, data, { ttl: 1000 * 60 * 60 });
    }

    return data;
  }

  // Get TV show details
  async getTVShowDetails(id: number) {
    const cacheKey = createCacheKey('tv', id);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest(cacheKey, () =>
      this.callTMDBAPI(`tv/${id}`, {
        append_to_response: 'videos,credits,similar,recommendations'
      })
    );

    if (data) {
      setCachedData(cacheKey, data, { ttl: 1000 * 60 * 60 });
    }

    return data;
  }

  // Get now playing movies
  async getNowPlayingMovies(page = 1) {
    const cacheKey = createCacheKey('now_playing', page);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest(cacheKey, () =>
      this.callTMDBAPI('movie/now_playing', { page })
    );

    if (data) {
      setCachedData(cacheKey, data, { ttl: 1000 * 60 * 30 });
    }

    return data;
  }

  // Get popular movies
  async getPopularMovies(page = 1) {
    const cacheKey = createCacheKey('popular_movies', page);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest(cacheKey, () =>
      this.callTMDBAPI('movie/popular', { page })
    );

    if (data) {
      setCachedData(cacheKey, data, { ttl: 1000 * 60 * 30 });
    }

    return data;
  }

  // Get popular TV shows
  async getPopularTVShows(page = 1) {
    const cacheKey = createCacheKey('popular_tv', page);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest(cacheKey, () =>
      this.callTMDBAPI('tv/popular', { page })
    );

    if (data) {
      setCachedData(cacheKey, data, { ttl: 1000 * 60 * 30 });
    }

    return data;
  }

  // Clear cache
  clearCache(pattern?: string) {
    if (pattern) {
      const storage = window.localStorage;
      const keys = Object.keys(storage).filter(key => key.includes(pattern));
      keys.forEach(key => storage.removeItem(key));
    } else {
      const storage = window.localStorage;
      const keys = Object.keys(storage).filter(key => key.startsWith('cache_'));
      keys.forEach(key => storage.removeItem(key));
    }
  }
}

export const secureAPI = SecureAPIService.getInstance();