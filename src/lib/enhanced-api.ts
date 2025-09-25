import { safeFetch } from "@/utils/api";
import { getCachedData, setCachedData, createCacheKey } from "./api-cache";
import { TMDB_BASE_URL } from "@/constants";

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMzQzYzU2N2ZhZTk3Y2JlZGM0OGQ1YWQ0Yjg5M2YzMSIsIm5iZiI6MTc0MTc1NzA2NC43MzMsInN1YiI6IjY3ZDExYTg4MTM5OTBhMDU4YjYwYWExMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PfUfbFyxCtI3bJehMrDRUuuKOPp58WC-_4B4aUovCyA";

const API_OPTIONS: RequestInit = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_TOKEN}`
  }
};

// Enhanced API service with better caching and error handling
export class EnhancedAPIService {
  private static instance: EnhancedAPIService;
  private requestQueue: Map<string, Promise<any>> = new Map();

  static getInstance(): EnhancedAPIService {
    if (!EnhancedAPIService.instance) {
      EnhancedAPIService.instance = new EnhancedAPIService();
    }
    return EnhancedAPIService.instance;
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

  // Enhanced search with filters
  async advancedSearch(params: {
    query: string;
    type?: 'movie' | 'tv' | 'person' | 'all';
    genre?: number;
    year?: number;
    sortBy?: 'popularity.desc' | 'vote_average.desc' | 'release_date.desc';
    page?: number;
  }) {
    const cacheKey = createCacheKey('search', JSON.stringify(params));
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    let endpoint = '';
    if (params.type === 'all' || !params.type) {
      endpoint = `${TMDB_BASE_URL}/search/multi`;
    } else {
      endpoint = `${TMDB_BASE_URL}/search/${params.type}`;
    }

    const url = new URL(endpoint);
    url.searchParams.append('query', params.query);
    if (params.page) url.searchParams.append('page', params.page.toString());

    const data = await this.makeRequest(cacheKey, () => 
      safeFetch(url.toString(), API_OPTIONS)
    );

    if (data) {
      setCachedData(cacheKey, data, { ttl: 1000 * 60 * 10 });
    }

    return data;
  }

  // Get trending content with time window
  async getTrendingContent(mediaType: 'movie' | 'tv' | 'all', timeWindow: 'day' | 'week' = 'week') {
    const cacheKey = createCacheKey('trending', mediaType, timeWindow);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest(cacheKey, () =>
      safeFetch(`${TMDB_BASE_URL}/trending/${mediaType}/${timeWindow}`, API_OPTIONS)
    );

    if (data) {
      setCachedData(cacheKey, data, { ttl: 1000 * 60 * 30 });
    }

    return data;
  }

  // Get detailed recommendations
  async getDetailedRecommendations(mediaType: 'movie' | 'tv', id: number, page = 1) {
    const cacheKey = createCacheKey('recommendations', mediaType, id, page);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest(cacheKey, () =>
      safeFetch(`${TMDB_BASE_URL}/${mediaType}/${id}/recommendations?page=${page}`, API_OPTIONS)
    );

    if (data) {
      setCachedData(cacheKey, data, { ttl: 1000 * 60 * 60 });
    }

    return data;
  }

  // Get content by multiple criteria
  async discoverContent(params: {
    type: 'movie' | 'tv';
    genres?: number[];
    year?: number;
    rating?: number;
    sortBy?: string;
    page?: number;
    withKeywords?: number[];
    withCast?: number[];
    withCrew?: number[];
  }) {
    const cacheKey = createCacheKey('discover', JSON.stringify(params));
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const url = new URL(`${TMDB_BASE_URL}/discover/${params.type}`);
    
    if (params.genres?.length) {
      url.searchParams.append('with_genres', params.genres.join(','));
    }
    if (params.year) {
      const yearParam = params.type === 'movie' ? 'year' : 'first_air_date_year';
      url.searchParams.append(yearParam, params.year.toString());
    }
    if (params.rating) {
      url.searchParams.append('vote_average.gte', params.rating.toString());
    }
    if (params.sortBy) {
      url.searchParams.append('sort_by', params.sortBy);
    }
    if (params.page) {
      url.searchParams.append('page', params.page.toString());
    }
    if (params.withKeywords?.length) {
      url.searchParams.append('with_keywords', params.withKeywords.join(','));
    }
    if (params.withCast?.length) {
      url.searchParams.append('with_cast', params.withCast.join(','));
    }
    if (params.withCrew?.length) {
      url.searchParams.append('with_crew', params.withCrew.join(','));
    }

    const data = await this.makeRequest(cacheKey, () =>
      safeFetch(url.toString(), API_OPTIONS)
    );

    if (data) {
      setCachedData(cacheKey, data, { ttl: 1000 * 60 * 30 });
    }

    return data;
  }

  // Get comprehensive details including all appendable responses
  async getComprehensiveDetails(mediaType: 'movie' | 'tv', id: number) {
    const cacheKey = createCacheKey('comprehensive', mediaType, id);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const appendToResponse = [
      'videos',
      'credits',
      'images',
      'similar',
      'recommendations',
      'reviews',
      'keywords',
      'watch/providers'
    ].join(',');

    const data = await this.makeRequest(cacheKey, () =>
      safeFetch(`${TMDB_BASE_URL}/${mediaType}/${id}?append_to_response=${appendToResponse}`, API_OPTIONS)
    );

    if (data) {
      setCachedData(cacheKey, data, { ttl: 1000 * 60 * 60 * 2 });
    }

    return data;
  }

  // Batch fetch multiple items
  async batchFetch(requests: Array<{ type: 'movie' | 'tv'; id: number }>) {
    const promises = requests.map(req => 
      this.getComprehensiveDetails(req.type, req.id)
    );

    return Promise.allSettled(promises);
  }

  // Clear cache for a specific pattern
  clearCache(pattern?: string) {
    if (pattern) {
      // Clear specific cache entries
      const storage = window.localStorage;
      const keys = Object.keys(storage).filter(key => key.includes(pattern));
      keys.forEach(key => storage.removeItem(key));
    } else {
      // Clear all API cache
      const storage = window.localStorage;
      const keys = Object.keys(storage).filter(key => key.startsWith('cache_'));
      keys.forEach(key => storage.removeItem(key));
    }
  }
}

export const enhancedAPI = EnhancedAPIService.getInstance();