
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from "firebase/firestore";
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
}

export const addToWatchHistory = async (user: User, watchData: Omit<WatchProgress, "lastWatched">) => {
  if (!user) return;
  
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
  if (!user) return [];
  
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

export const getWatchProgress = async (user: User, type: "movie" | "tv", id: number) => {
  if (!user) return null;
  
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
