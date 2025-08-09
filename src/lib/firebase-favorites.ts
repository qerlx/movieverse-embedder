import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";

export interface FavoriteItem {
  id: string;
  userId: string;
  mediaId: string;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  addedAt: any; // Firebase Timestamp
}

/**
 * Toggle favorite status for a media item
 */
export async function toggleFavorite(
  user: User,
  {
    mediaId,
    mediaType,
    title,
    posterPath,
  }: {
    mediaId: string;
    mediaType: "movie" | "tv";
    title: string;
    posterPath: string | null;
  }
) {
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const favoritesRef = collection(db, "favorites");
    const q = query(
      favoritesRef,
      where("userId", "==", user.uid),
      where("mediaId", "==", mediaId),
      where("mediaType", "==", mediaType)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Remove from favorites
      const docToDelete = snapshot.docs[0];
      await deleteDoc(doc(db, "favorites", docToDelete.id));
      return { success: true, isFavorite: false };
    } else {
      // Add to favorites
      await addDoc(favoritesRef, {
        userId: user.uid,
        mediaId,
        mediaType,
        title,
        posterPath,
        addedAt: serverTimestamp(),
      });
      return { success: true, isFavorite: true };
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw new Error("Failed to toggle favorite");
  }
}

/**
 * Get user's favorites
 */
export async function getFavorites(user: User): Promise<FavoriteItem[]> {
  if (!user) return [];

  try {
    const favoritesRef = collection(db, "favorites");
    const q = query(
      favoritesRef,
      where("userId", "==", user.uid),
      orderBy("addedAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as FavoriteItem));
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
}

/**
 * Check if a media item is favorited
 */
export async function checkFavoriteStatus(
  user: User,
  {
    mediaId,
    mediaType,
  }: {
    mediaId: string;
    mediaType: "movie" | "tv";
  }
) {
  if (!user) return { isFavorite: false };

  try {
    const favoritesRef = collection(db, "favorites");
    const q = query(
      favoritesRef,
      where("userId", "==", user.uid),
      where("mediaId", "==", mediaId),
      where("mediaType", "==", mediaType)
    );

    const snapshot = await getDocs(q);
    return { isFavorite: !snapshot.empty };
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return { isFavorite: false };
  }
}

// Legacy exports for backward compatibility
export const addToFavorites = async (
  userId: string,
  itemId: number,
  itemType: 'movie' | 'tv',
  title: string,
  posterPath?: string
) => {
  throw new Error("Use toggleFavorite instead");
};

export const removeFromFavorites = async (
  userId: string,
  itemId: number,
  itemType: 'movie' | 'tv'
) => {
  throw new Error("Use toggleFavorite instead");
};

export const checkIsFavorite = async (
  userId: string,
  itemId: number,
  itemType: 'movie' | 'tv'
) => {
  throw new Error("Use checkFavoriteStatus instead");
};

export const getUserFavorites = async (userId: string) => {
  throw new Error("Use getFavorites instead");
};