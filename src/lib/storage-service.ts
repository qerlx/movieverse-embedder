import { User } from "firebase/auth";
import { getFavorites, toggleFavorite as firebaseToggleFavorite, checkFavoriteStatus } from "./firebase-favorites";
import { getRecentlyWatched as firebaseGetRecentlyWatched, addToWatchHistory } from "./firebase-watch";

export interface LocalFavorite {
  id: string;
  mediaId: string;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  addedAt: number;
}

export interface LocalWatchHistory {
  id: string;
  mediaId: string;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  progress?: number;
  lastEpisode?: {
    season: number;
    episode: number;
    name: string;
  };
  lastWatched: number;
}

const STORAGE_KEYS = {
  FAVORITES: 'local_favorites',
  RECENTLY_WATCHED: 'local_recently_watched',
  LAST_SYNC: 'last_sync_timestamp'
} as const;

/**
 * Hybrid storage service that uses localStorage for immediate access and Firebase for persistence
 */
class StorageService {
  // Favorites Management
  async getFavorites(user?: User): Promise<LocalFavorite[]> {
    const localFavorites = this.getLocalFavorites();
    
    if (!user) {
      return localFavorites;
    }

    try {
      // Sync with Firebase in background
      this.syncFavoritesFromFirebase(user);
      return localFavorites;
    } catch (error) {
      console.error('Error syncing favorites:', error);
      return localFavorites;
    }
  }

  private getLocalFavorites(): LocalFavorite[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading local favorites:', error);
      return [];
    }
  }

  private saveLocalFavorites(favorites: LocalFavorite[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving local favorites:', error);
    }
  }

  async toggleFavorite(
    mediaId: string,
    mediaType: "movie" | "tv",
    title: string,
    posterPath?: string,
    user?: User
  ): Promise<{ success: boolean; isFavorite: boolean }> {
    const favorites = this.getLocalFavorites();
    const existingIndex = favorites.findIndex(
      f => f.mediaId === mediaId && f.mediaType === mediaType
    );

    let isFavorite = false;

    if (existingIndex >= 0) {
      // Remove from favorites
      favorites.splice(existingIndex, 1);
      isFavorite = false;
    } else {
      // Add to favorites
      const newFavorite: LocalFavorite = {
        id: `${mediaType}_${mediaId}_${Date.now()}`,
        mediaId,
        mediaType,
        title,
        posterPath: posterPath || null,
        addedAt: Date.now()
      };
      favorites.unshift(newFavorite);
      isFavorite = true;
    }

    // Save locally immediately
    this.saveLocalFavorites(favorites);

    // Sync with Firebase in background if user is logged in
    if (user) {
      try {
        await firebaseToggleFavorite(user, {
          mediaId,
          mediaType,
          title,
          posterPath: posterPath || null
        });
      } catch (error) {
        console.error('Error syncing favorite with Firebase:', error);
        // Don't revert local change, just log the error
      }
    }

    return { success: true, isFavorite };
  }

  async isFavorite(mediaId: string, mediaType: "movie" | "tv", user?: User): Promise<boolean> {
    const favorites = this.getLocalFavorites();
    const localIsFavorite = favorites.some(
      f => f.mediaId === mediaId && f.mediaType === mediaType
    );

    // If user is logged in, check Firebase in background and sync if different
    if (user) {
      try {
        const firebaseResult = await checkFavoriteStatus(user, { mediaId, mediaType });
        if (firebaseResult.isFavorite !== localIsFavorite) {
          // Sync difference
          this.syncFavoritesFromFirebase(user);
        }
        return firebaseResult.isFavorite;
      } catch (error) {
        console.error('Error checking Firebase favorite status:', error);
      }
    }

    return localIsFavorite;
  }

  // Generic storage methods
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  private async syncFavoritesFromFirebase(user: User): Promise<void> {
    try {
      const firebaseFavorites = await getFavorites(user);
      const localFavorites: LocalFavorite[] = firebaseFavorites.map(f => ({
        id: f.id,
        mediaId: f.mediaId,
        mediaType: f.mediaType,
        title: f.title,
        posterPath: f.posterPath,
        addedAt: f.addedAt?.toMillis?.() || Date.now()
      }));
      
      this.saveLocalFavorites(localFavorites);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
    } catch (error) {
      console.error('Error syncing favorites from Firebase:', error);
    }
  }

  // Recently Watched Management
  async getRecentlyWatched(user?: User, limit = 10): Promise<LocalWatchHistory[]> {
    const localHistory = this.getLocalWatchHistory().slice(0, limit);
    
    if (!user) {
      return localHistory;
    }

    try {
      // Sync with Firebase in background
      this.syncWatchHistoryFromFirebase(user);
      return localHistory;
    } catch (error) {
      console.error('Error syncing watch history:', error);
      return localHistory;
    }
  }

  private getLocalWatchHistory(): LocalWatchHistory[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECENTLY_WATCHED);
      const history = stored ? JSON.parse(stored) : [];
      // Sort by lastWatched descending
      return history.sort((a: LocalWatchHistory, b: LocalWatchHistory) => b.lastWatched - a.lastWatched);
    } catch (error) {
      console.error('Error reading local watch history:', error);
      return [];
    }
  }

  private saveLocalWatchHistory(history: LocalWatchHistory[]): void {
    try {
      // Keep only the most recent 50 items to prevent localStorage bloat
      const trimmedHistory = history.slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.RECENTLY_WATCHED, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Error saving local watch history:', error);
    }
  }

  async addToWatchHistory(
    mediaId: string,
    mediaType: "movie" | "tv",
    title: string,
    posterPath?: string,
    progress?: number,
    lastEpisode?: { season: number; episode: number; name: string },
    user?: User
  ): Promise<void> {
    const history = this.getLocalWatchHistory();
    
    // Remove existing entry for this media
    const filteredHistory = history.filter(
      h => !(h.mediaId === mediaId && h.mediaType === mediaType)
    );

    // Add new entry at the beginning
    const newEntry: LocalWatchHistory = {
      id: `${mediaType}_${mediaId}_${Date.now()}`,
      mediaId,
      mediaType,
      title,
      posterPath: posterPath || null,
      progress,
      lastEpisode,
      lastWatched: Date.now()
    };

    filteredHistory.unshift(newEntry);
    this.saveLocalWatchHistory(filteredHistory);

    // Sync with Firebase in background if user is logged in
    if (user) {
      try {
        await addToWatchHistory(user, {
          mediaId,
          mediaType,
          title,
          posterPath: posterPath || null,
          progress,
          lastEpisode
        });
      } catch (error) {
        console.error('Error syncing watch history with Firebase:', error);
      }
    }
  }

  private async syncWatchHistoryFromFirebase(user: User): Promise<void> {
    try {
      const firebaseHistory = await firebaseGetRecentlyWatched(user, 30);
      const localHistory: LocalWatchHistory[] = firebaseHistory.map(w => ({
        id: w.id,
        mediaId: w.mediaId,
        mediaType: w.mediaType,
        title: w.title,
        posterPath: w.posterPath,
        progress: w.progress,
        lastEpisode: w.lastEpisode,
        lastWatched: w.lastWatched?.toMillis?.() || Date.now()
      }));
      
      this.saveLocalWatchHistory(localHistory);
    } catch (error) {
      console.error('Error syncing watch history from Firebase:', error);
    }
  }

  // Utility methods
  clearLocalData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.FAVORITES);
      localStorage.removeItem(STORAGE_KEYS.RECENTLY_WATCHED);
      localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  }

  async syncWithFirebase(user: User): Promise<void> {
    try {
      await Promise.all([
        this.syncFavoritesFromFirebase(user),
        this.syncWatchHistoryFromFirebase(user)
      ]);
    } catch (error) {
      console.error('Error syncing with Firebase:', error);
    }
  }
}

export const storageService = new StorageService();
