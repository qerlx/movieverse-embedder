
import { db } from "./firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

/**
 * Add an item to a user's favorites
 */
export const addToFavorites = async (
  userId: string,
  itemId: number,
  itemType: 'movie' | 'tv',
  title: string,
  posterPath?: string
) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    const favoriteItem = {
      id: itemId,
      type: itemType,
      title: title,
      poster_path: posterPath || null,
      added_at: new Date().toISOString()
    };

    if (userDoc.exists()) {
      // User document exists, update with new favorite
      await updateDoc(userRef, {
        favorites: arrayUnion(favoriteItem)
      });
    } else {
      // User document doesn't exist, create it
      await setDoc(userRef, {
        favorites: [favoriteItem]
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
};

/**
 * Remove an item from a user's favorites
 */
export const removeFromFavorites = async (
  userId: string,
  itemId: number,
  itemType: 'movie' | 'tv'
) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const favorites = userDoc.data().favorites || [];
    const itemToRemove = favorites.find(
      (item: any) => item.id === itemId && item.type === itemType
    );
    
    if (!itemToRemove) {
      return false;
    }
    
    await updateDoc(userRef, {
      favorites: arrayRemove(itemToRemove)
    });
    
    return true;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
};

/**
 * Check if an item is in a user's favorites
 */
export const checkIsFavorite = async (
  userId: string,
  itemId: number,
  itemType: 'movie' | 'tv'
) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const favorites = userDoc.data().favorites || [];
    return favorites.some(
      (item: any) => item.id === itemId && item.type === itemType
    );
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
};

/**
 * Get a user's favorite items
 */
export const getUserFavorites = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return [];
    }
    
    const favorites = userDoc.data().favorites || [];
    return favorites;
  } catch (error) {
    console.error("Error getting favorites:", error);
    return [];
  }
};
