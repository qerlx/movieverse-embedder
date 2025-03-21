
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User } from "firebase/auth";

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

export const addToWatchHistory = async (user: User, watchData: Omit<WatchProgress, "lastWatched">) => {
  if (!user || !user.uid) {
    console.error("Invalid user object");
    throw new Error("User not authenticated");
  }
  
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Create new user document if it doesn't exist
      await setDoc(userDocRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        watchHistory: []
      });
    }
    
    // Get watch history collection for this user
    const watchHistoryRef = doc(db, "users", user.uid, "watchHistory", `${watchData.type}_${watchData.id}`);
    const watchHistoryDoc = await getDoc(watchHistoryRef);
    
    if (watchHistoryDoc.exists()) {
      // Update existing watch history entry
      await updateDoc(watchHistoryRef, {
        ...watchData,
        lastWatched: Date.now()
      });
    } else {
      // Create new watch history entry
      await setDoc(watchHistoryRef, {
        ...watchData,
        lastWatched: Date.now()
      });
    }
  } catch (error) {
    console.error("Error updating watch history:", error);
    throw error;
  }
};

export const getWatchHistory = async (user: User): Promise<WatchProgress[]> => {
  if (!user || !user.uid) return [];
  
  try {
    const watchHistoryRef = collection(db, "users", user.uid, "watchHistory");
    const watchHistorySnapshot = await getDocs(watchHistoryRef);
    
    return watchHistorySnapshot.docs.map(doc => doc.data() as WatchProgress)
      .sort((a, b) => b.lastWatched - a.lastWatched); // Sort by most recently watched
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
    const watchHistoryRef = doc(db, "users", user.uid, "watchHistory", `${type}_${id}`);
    const watchHistoryDoc = await getDoc(watchHistoryRef);
    
    if (watchHistoryDoc.exists()) {
      return watchHistoryDoc.data() as WatchProgress;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching watch progress:", error);
    return null;
  }
};

// Favorites functionality
export const addToFavorites = async (user: User, itemData: Omit<FavoriteItem, "addedAt">) => {
  if (!user || !user.uid) {
    console.error("Invalid user object");
    throw new Error("User not authenticated");
  }
  
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Create new user document if it doesn't exist
      await setDoc(userDocRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    }
    
    // Add to favorites collection
    const favoritesRef = doc(db, "favorites", `${user.uid}_${itemData.type}_${itemData.id}`);
    
    await setDoc(favoritesRef, {
      userId: user.uid,
      itemId: itemData.id,
      itemType: itemData.type,
      title: itemData.title,
      posterPath: itemData.posterPath,
      addedAt: Date.now()
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
};

export const removeFromFavorites = async (user: User, type: "movie" | "tv", id: number) => {
  if (!user || !user.uid) {
    console.error("Invalid user object");
    throw new Error("User not authenticated");
  }
  
  try {
    const favoriteRef = doc(db, "favorites", `${user.uid}_${type}_${id}`);
    await deleteDoc(favoriteRef);
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
};

export const getFavorites = async (user: User): Promise<FavoriteItem[]> => {
  if (!user || !user.uid) return [];
  
  try {
    const favoritesQuery = query(
      collection(db, "favorites"),
      where("userId", "==", user.uid)
    );
    
    const favoritesSnapshot = await getDocs(favoritesQuery);
    
    return favoritesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.itemId,
        type: data.itemType,
        title: data.title,
        posterPath: data.posterPath,
        addedAt: data.addedAt,
      } as FavoriteItem;
    }).sort((a, b) => b.addedAt - a.addedAt); // Sort by most recently added
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
};

export const isFavorite = async (user: User, type: "movie" | "tv", id: number): Promise<boolean> => {
  if (!user || !user.uid) return false;
  
  try {
    const favoriteRef = doc(db, "favorites", `${user.uid}_${type}_${id}`);
    const favoriteDoc = await getDoc(favoriteRef);
    
    return favoriteDoc.exists();
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
};
