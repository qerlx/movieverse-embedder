// TMDb API Types
export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  popularity: number;
  adult: boolean;
  video: boolean;
  original_language: string;
  original_title?: string;
  score?: number; // For recommendation scoring
  media_type?: "movie"; // Add this for compatibility
  type?: "movie"; // Add this for compatibility with watch history
  progress?: number; // Add this for watch history
}

export interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: Genre[];
  popularity: number;
  original_language: string;
  original_name?: string;
  origin_country: string[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: Season[];
  status?: string; // Add status property
  score?: number; // For recommendation scoring
  media_type?: "tv"; // Add this for compatibility
  type?: "tv"; // Add this for compatibility with watch history
  progress?: number; // Add this for watch history
  lastEpisode?: {
    season: number;
    episode: number;
    name?: string;
  }; // Add this for watch history
}

// Extended types for watch history
export interface WatchHistoryItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  progress?: number;
  lastWatched: number;
  genres?: number[];
}

export interface TVWatchHistoryItem extends WatchHistoryItem {
  type: "tv";
  lastEpisode?: {
    season: number;
    episode: number;
    name?: string;
  };
}

export type CombinedWatchHistoryItem = WatchHistoryItem | TVWatchHistoryItem;

export interface Season {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  poster_path: string | null;
  episodes?: Episode[]; // Add episodes property to match EpisodeSelector expectations
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  runtime?: number; // Make runtime optional to match the API response
}

export interface Genre {
  id: number;
  name: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface ConfigurationResponse {
  images: {
    base_url: string;
    secure_base_url: string;
    backdrop_sizes: string[];
    logo_sizes: string[];
    poster_sizes: string[];
    profile_sizes: string[];
    still_sizes: string[];
  };
  change_keys: string[];
}

export interface MovieResult {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface TVResult {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
}

export interface SearchResult {
  page: number;
  results: (Movie | TVShow)[];
  total_pages: number;
  total_results: number;
}

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type?: "movie" | "tv";
}

export interface FavoriteItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  addedAt: number; // timestamp
}

export interface ContinueWatchingItem {
  id: number;
  type: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path: string | null;
  progress?: number;
  lastEpisode?: {
    season: number;
    episode: number;
    name?: string;
  };
}

// Collection types
export interface Collection {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts?: Movie[];
}
