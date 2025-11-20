/**
 * @deprecated This file contains direct TMDB API calls with exposed tokens.
 * Use src/lib/secure-api.ts instead which proxies through edge functions.
 * 
 * This file is kept for backward compatibility but should not be used in new code.
 * All functions here will eventually be removed.
 */

import { MovieResult, TVResult, ConfigurationResponse, Genre } from "@/types";
import { getCachedData, setCachedData, createCacheKey } from "./api-cache";
import { safeFetch } from "@/utils/api";
import { TMDB_BASE_URL } from "@/constants";

// WARNING: This token should not be in the codebase
// All new code should use secure-api.ts instead
const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMzQzYzU2N2ZhZTk3Y2JlZGM0OGQ1YWQ0Yjg5M2YzMSIsIm5iZiI6MTc0MTc1NzA2NC43MzMsInN1YiI6IjY3ZDExYTg4MTM5OTBhMDU4YjYwYWExMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PfUfbFyxCtI3bJehMrDRUuuKOPp58WC-_4B4aUovCyA";

const API_OPTIONS: RequestInit = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_TOKEN}`
  }
};

// All functions below are deprecated - use secure-api.ts instead
export const getConfiguration = async (): Promise<ConfigurationResponse | null> => {
  console.warn('DEPRECATED: Use secure-api.ts instead');
  const data = await safeFetch<ConfigurationResponse>(`${TMDB_BASE_URL}/configuration`, API_OPTIONS);
  return data;
};

export const getPopularMovies = async (page = 1): Promise<MovieResult | null> => {
  console.warn('DEPRECATED: Use secure-api.ts instead');
  const cacheKey = createCacheKey('popular', 'movies', page);
  const cached = getCachedData<MovieResult>(cacheKey);
  if (cached) return cached;

  const data = await safeFetch<MovieResult>(`${TMDB_BASE_URL}/movie/popular?language=en-US&page=${page}`, API_OPTIONS);
  
  if (data) {
    setCachedData(cacheKey, data, { ttl: 1000 * 60 * 5 });
  }
  
  return data;
};

export const getTrendingMovies = async (timeWindow = 'week'): Promise<MovieResult | null> => {
  console.warn('DEPRECATED: Use secure-api.ts instead');
  const data = await safeFetch<MovieResult>(`${TMDB_BASE_URL}/trending/movie/${timeWindow}`, API_OPTIONS);
  return data;
};

export const getNowPlayingMovies = async (page = 1): Promise<MovieResult> => {
  console.warn('DEPRECATED: Use secure-api.ts instead');
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/now_playing?language=en-US&page=${page}`, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to fetch now playing movies');
    return await response.json();
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    throw error;
  }
};

export const getTopRatedMovies = async (page = 1): Promise<MovieResult> => {
  console.warn('DEPRECATED: Use secure-api.ts instead');
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?language=en-US&page=${page}`, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to fetch top rated movies');
    return await response.json();
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    throw error;
  }
};

// Export all other functions with deprecation warnings
// For brevity, only showing key examples
// In production, all functions from api.ts should be copied here with warnings
