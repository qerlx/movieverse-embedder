
interface WatchProgress {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  progress?: number; // For movies: percentage watched
  lastEpisode?: {   // For TV shows
    season: number;
    episode: number;
    name: string;
  };
  lastWatched: number; // timestamp
  genres?: number[]; // Added genres for better recommendations
}

interface FavoriteItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  addedAt: number; // timestamp
}

// Helper functions for localStorage
const getLocalStorageKey = (userId: string, collection: string) => `user_${userId}_${collection}`;

const getLocalStorageCollection = (userId: string, collection: string): Record<string, any> => {
  const key = getLocalStorageKey(userId, collection);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : {};
};

const setLocalStorageItem = (userId: string, collection: string, itemKey: string, item: any) => {
  const key = getLocalStorageKey(userId, collection);
  const collection_data = getLocalStorageCollection(userId, collection);
  collection_data[itemKey] = item;
  localStorage.setItem(key, JSON.stringify(collection_data));
};

const removeLocalStorageItem = (userId: string, collection: string, itemKey: string) => {
  const key = getLocalStorageKey(userId, collection);
  const collection_data = getLocalStorageCollection(userId, collection);
  delete collection_data[itemKey];
  localStorage.setItem(key, JSON.stringify(collection_data));
};

export const addToWatchHistory = async (user: User, watchData: Omit<WatchProgress, "lastWatched">) => {
  if (!user || !user.uid) {
    throw new Error("User not authenticated");
  }
  
  try {
    const userId = user.uid;
    const itemKey = `${watchData.type}_${watchData.id}`;
    
    setLocalStorageItem(userId, "watchHistory", itemKey, {
      ...watchData,
      lastWatched: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating watch history:", error);
    throw error;
  }
};

export const getWatchHistory = async (user: User): Promise<WatchProgress[]> => {
  if (!user || !user.uid) return [];
  
  try {
    const userId = user.uid;
    const watchHistoryData = getLocalStorageCollection(userId, "watchHistory");
    
    return Object.values(watchHistoryData)
      .sort((a: WatchProgress, b: WatchProgress) => b.lastWatched - a.lastWatched);
  } catch (error) {
    console.error("Error fetching watch history:", error);
    return [];
  }
};

export const getRecentlyWatched = async (user: User, limit = 6): Promise<WatchProgress[]> => {
  if (!user || !user.uid) return [];
  
  try {
    const watchHistory = await getWatchHistory(user);
    return watchHistory.slice(0, limit); // Return only the most recent items
  } catch (error) {
    console.error("Error fetching recently watched:", error);
    return [];
  }
};

export const getWatchProgress = async (user: User, type: "movie" | "tv", id: number) => {
  if (!user || !user.uid) return null;
  
  try {
    const userId = user.uid;
    const watchHistoryData = getLocalStorageCollection(userId, "watchHistory");
    const itemKey = `${type}_${id}`;
    
    return watchHistoryData[itemKey] || null;
  } catch (error) {
    console.error("Error fetching watch progress:", error);
    return null;
  }
};

export const addToFavorites = async (user: User, itemData: Omit<FavoriteItem, "addedAt">) => {
  if (!user || !user.uid) {
    throw new Error("User not authenticated");
  }
  
  try {
    const userId = user.uid;
    const itemKey = `${itemData.type}_${itemData.id}`;
    
    setLocalStorageItem(userId, "favorites", itemKey, {
      ...itemData,
      addedAt: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
};

export const removeFromFavorites = async (user: User, type: "movie" | "tv", id: number) => {
  if (!user || !user.uid) {
    throw new Error("User not authenticated");
  }
  
  try {
    const userId = user.uid;
    const itemKey = `${type}_${id}`;
    
    removeLocalStorageItem(userId, "favorites", itemKey);
    
    return true;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
};

export const getFavorites = async (user: User): Promise<FavoriteItem[]> => {
  if (!user || !user.uid) return [];
  
  try {
    const userId = user.uid;
    const favoritesData = getLocalStorageCollection(userId, "favorites");
    
    return Object.values(favoritesData)
      .sort((a: FavoriteItem, b: FavoriteItem) => b.addedAt - a.addedAt);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
};

export const isFavorite = async (user: User, type: "movie" | "tv", id: number): Promise<boolean> => {
  if (!user || !user.uid) return false;
  
  try {
    const userId = user.uid;
    const favoritesData = getLocalStorageCollection(userId, "favorites");
    const itemKey = `${type}_${id}`;
    
    return !!favoritesData[itemKey];
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
};
