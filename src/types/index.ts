
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
  score?: number; // For recommendation scoring
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  poster_path: string | null;
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
