import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";

export interface WatchProgress {
  id: string;
  userId: string;
  mediaId: string;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  progress?: number; // For movies: percentage watched
  lastEpisode?: {   // For TV shows
    season: number;
    episode: number;
    name: string;
  };
  lastWatched: any; // Firebase Timestamp
  genres?: number[]; // For better recommendations
}

/**
 * Add item to watch history or update progress
 */
export async function addToWatchHistory(
  user: User, 
  watchData: {
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
    genres?: number[];
  }
) {
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  try {
    const watchRef = doc(db, "watchHistory", `${user.uid}_${watchData.mediaType}_${watchData.mediaId}`);
    
    await setDoc(watchRef, {
      userId: user.uid,
      mediaId: watchData.mediaId,
      mediaType: watchData.mediaType,
      title: watchData.title,
      posterPath: watchData.posterPath,
      progress: watchData.progress || 0,
      lastEpisode: watchData.lastEpisode || null,
      genres: watchData.genres || [],
      lastWatched: serverTimestamp(),
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error("Error updating watch history:", error);
    throw error;
  }
}

/**
 * Get watch history for user
 */
export async function getWatchHistory(user: User): Promise<WatchProgress[]> {
  if (!user) return [];
  
  try {
    const watchRef = collection(db, "watchHistory");
    const q = query(
      watchRef,
      where("userId", "==", user.uid),
      orderBy("lastWatched", "desc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as WatchProgress));
  } catch (error) {
    console.error("Error fetching watch history:", error);
    return [];
  }
}

/**
 * Get recently watched items
 */
export async function getRecentlyWatched(user: User, limitCount = 6): Promise<WatchProgress[]> {
  if (!user) return [];
  
  try {
    const watchRef = collection(db, "watchHistory");
    const q = query(
      watchRef,
      where("userId", "==", user.uid),
      orderBy("lastWatched", "desc"),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as WatchProgress));
  } catch (error) {
    console.error("Error fetching recently watched:", error);
    return [];
  }
}

/**
 * Get watch progress for specific item
 */
export async function getWatchProgress(
  user: User, 
  mediaType: "movie" | "tv", 
  mediaId: string
): Promise<WatchProgress | null> {
  if (!user) return null;
  
  try {
    const watchRef = collection(db, "watchHistory");
    const q = query(
      watchRef,
      where("userId", "==", user.uid),
      where("mediaType", "==", mediaType),
      where("mediaId", "==", mediaId)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as WatchProgress;
  } catch (error) {
    console.error("Error fetching watch progress:", error);
    return null;
  }
}

/**
 * Update watch progress
 */
export async function updateWatchProgress(
  user: User, 
  mediaType: "movie" | "tv", 
  mediaId: string, 
  progress: number
): Promise<boolean> {
  if (!user) return false;
  
  try {
    const watchRef = doc(db, "watchHistory", `${user.uid}_${mediaType}_${mediaId}`);
    
    await setDoc(watchRef, {
      progress,
      lastWatched: serverTimestamp(),
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error("Error updating watch progress:", error);
    return false;
  }
}

/**
 * Remove a specific watch history item
 */
export async function removeFromWatchHistory(
  user: User,
  mediaType: "movie" | "tv",
  mediaId: string
): Promise<boolean> {
  if (!user) return false;

  try {
    const watchRef = doc(db, "watchHistory", `${user.uid}_${mediaType}_${mediaId}`);
    await deleteDoc(watchRef);
    return true;
  } catch (error) {
    console.error("Error removing from watch history:", error);
    return false;
  }
}

/**
 * Clear all watch history for a user
 */
export async function clearWatchHistory(user: User): Promise<boolean> {
  if (!user) return false;

  try {
    const watchRef = collection(db, "watchHistory");
    const q = query(
      watchRef,
      where("userId", "==", user.uid)
    );

    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(docSnap => 
      deleteDoc(doc(db, "watchHistory", docSnap.id))
    );

    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error("Error clearing watch history:", error);
    return false;
  }
}