// Storage keys
export const STORAGE_KEYS = {
  WATCH_PROGRESS: 'watch_progress',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  VIDEO_SOURCE: 'video_source'
} as const;

// Video sources configuration
export const VIDORA_THEME_COLOR = "8B5CF6"; // Purple color matching theme

// API configuration
export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// UI constants
export const DEFAULT_GRID_COLUMNS = {
  mobile: 1,
  tablet: 2,
  desktop: 3
} as const;

export const LOADING_SKELETON_COUNT = 6;

// Video player settings
export const VIDEO_PLAYER_SETTINGS = {
  autoplay: true,
  pausescreen: true,
  autonextepisode: true
} as const;

// Responsive breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;