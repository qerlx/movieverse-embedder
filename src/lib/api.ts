
import { MovieResult, TVResult, ConfigurationResponse, Genre } from "@/types";

export const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMzQzYzU2N2ZhZTk3Y2JlZGM0OGQ1YWQ0Yjg5M2YzMSIsIm5iZiI6MTc0MTc1NzA2NC43MzMsInN1YiI6IjY3ZDExYTg4MTM5OTBhMDU4YjYwYWExMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PfUfbFyxCtI3bJehMrDRUuuKOPp58WC-_4B4aUovCyA";
export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const EMBED_BASE_URL = "https://vidora.su";

export const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_TOKEN}`
  }
};

// Get TMDb configuration
export const getConfiguration = async (): Promise<ConfigurationResponse> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/configuration`, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to fetch configuration');
    return await response.json();
  } catch (error) {
    console.error('Error fetching configuration:', error);
    throw error;
  }
};

// Get popular movies
export const getPopularMovies = async (page = 1): Promise<MovieResult> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?language=en-US&page=${page}`, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to fetch popular movies');
    return await response.json();
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

// Get trending movies
export const getTrendingMovies = async (timeWindow = 'week'): Promise<MovieResult> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/trending/movie/${timeWindow}`, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to fetch trending movies');
    return await response.json();
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    throw error;
  }
};

// Get now playing movies
export const getNowPlayingMovies = async (page = 1): Promise<MovieResult> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/now_playing?language=en-US&page=${page}`, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to fetch now playing movies');
    return await response.json();
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    throw error;
  }
};

// Get top rated movies
export const getTopRatedMovies = async (page = 1): Promise<MovieResult> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?language=en-US&page=${page}`, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to fetch top rated movies');
    return await response.json();
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    throw error;
  }
};

// Get movies by genre
export const getMoviesByGenre = async (genreId: number, page = 1): Promise<MovieResult> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?with_genres=${genreId}&page=${page}&sort_by=popularity.desc`,
      API_OPTIONS
    );
    if (!response.ok) throw new Error('Failed to fetch movies by genre');
    return await response.json();
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    throw error;
  }
};

// Get popular TV shows
export const getPopularTVShows = async (page = 1): Promise<TVResult> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/tv/popular?language=en-US&page=${page}`, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to fetch popular TV shows');
    return await response.json();
  } catch (error) {
    console.error('Error fetching popular TV shows:', error);
    throw error;
  }
};

// Get trending TV shows
export const getTrendingTVShows = async (timeWindow = 'week'): Promise<TVResult> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/trending/tv/${timeWindow}`, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to fetch trending TV shows');
    return await response.json();
  } catch (error) {
    console.error('Error fetching trending TV shows:', error);
    throw error;
  }
};

// Get top rated TV shows
export const getTopRatedTVShows = async (page = 1): Promise<TVResult> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/tv/top_rated?language=en-US&page=${page}`, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to fetch top rated TV shows');
    return await response.json();
  } catch (error) {
    console.error('Error fetching top rated TV shows:', error);
    throw error;
  }
};

// Get TV shows by genre
export const getTVShowsByGenre = async (genreId: number, page = 1): Promise<TVResult> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?with_genres=${genreId}&page=${page}&sort_by=popularity.desc`,
      API_OPTIONS
    );
    if (!response.ok) throw new Error('Failed to fetch TV shows by genre');
    return await response.json();
  } catch (error) {
    console.error('Error fetching TV shows by genre:', error);
    throw error;
  }
};

// Get movie details
export const getMovieDetails = async (id: number) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${id}?append_to_response=videos,credits,similar`, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to fetch movie details');
    return await response.json();
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

// Get TV show details
export const getTVShowDetails = async (id: number) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/tv/${id}?append_to_response=videos,credits,similar`, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to fetch TV show details');
    return await response.json();
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    throw error;
  }
};

// Get TV show season details - improved error handling
export const getTVShowSeasonDetails = async (id: number, seasonNumber: number) => {
  try {
    console.log(`Fetching season details for show ${id}, season ${seasonNumber}`);
    const response = await fetch(`${TMDB_BASE_URL}/tv/${id}/season/${seasonNumber}`, API_OPTIONS);
    
    const data = await response.json();
    
    // Even if we get a response, check for error structure in the response
    if (!response.ok || data.success === false) {
      console.error('API error response:', data);
      return { 
        success: false, 
        status_message: data.status_message || `Failed with status: ${response.status}`, 
        episodes: [] 
      };
    }
    
    // Safety check to ensure episodes exist
    if (!data.episodes || !Array.isArray(data.episodes)) {
      console.error('No episodes array in response:', data);
      return { 
        success: false, 
        status_message: 'No episodes data available', 
        episodes: [] 
      };
    }
    
    // Success case
    return { ...data, success: true };
  } catch (error) {
    console.error('Error fetching TV show season details:', error);
    return { 
      success: false, 
      status_message: 'Network or server error', 
      episodes: [] 
    };
  }
};

// Get TV show episodes
export const getTVShowEpisodes = async (id: number, season: number) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${
        import.meta.env.VITE_TMDB_API_KEY
      }&language=en-US`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch TV show episode data");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching TV show episode data:", error);
    throw error;
  }
};

// Search for movies and TV shows
export const searchMulti = async (query: string, page = 1) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=${page}`, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to search');
    return await response.json();
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
};

// Get movie genres
export const getMovieGenres = async (): Promise<{ genres: Genre[] }> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list?language=en`, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to fetch movie genres');
    return await response.json();
  } catch (error) {
    console.error('Error fetching movie genres:', error);
    throw error;
  }
};

// Get TV show genres
export const getTVGenres = async (): Promise<{ genres: Genre[] }> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/genre/tv/list?language=en`, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to fetch TV genres');
    return await response.json();
  } catch (error) {
    console.error('Error fetching TV genres:', error);
    throw error;
  }
};

// Get watch providers (JustWatch data)
export const getWatchProviders = async (type: 'movie' | 'tv', id: number) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}/watch/providers`, API_OPTIONS);
    if (!response.ok) throw new Error(`Failed to fetch watch providers for ${type} ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching watch providers for ${type} ${id}:`, error);
    throw error;
  }
};

// Generate Vidora embed URLs with customizable parameters
interface VidoraParams {
  autoplay?: boolean;
  colour?: string; // hex color without #
  autonextepisode?: boolean; 
  backbutton?: string; // URL
  logo?: string; // URL
  pausescreen?: boolean;
  idlecheck?: number; // minutes, 0 to disable
}

export const getVidoraMovieEmbedUrl = (tmdbId: number, params?: VidoraParams): string => {
  const url = new URL(`${EMBED_BASE_URL}/movie/${tmdbId}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
};

export const getVidoraTVEmbedUrl = (tmdbId: number, season: number, episode: number, params?: VidoraParams): string => {
  const url = new URL(`${EMBED_BASE_URL}/tv/${tmdbId}/${season}/${episode}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
};

// Legacy embed URLs
export const getMovieEmbedUrl = (tmdbId: number): string => {
  return `${EMBED_BASE_URL}/movie/${tmdbId}`;
};

export const getTVShowEmbedUrl = (tmdbId: number, season: number, episode: number): string => {
  return `${EMBED_BASE_URL}/tv/${tmdbId}/${season}/${episode}`;
};
