export interface WatchProgress {
  id: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  progress: number;
  watched_at?: string;
  lastEpisode?: {
    season: number;
    episode: number;
  };
}