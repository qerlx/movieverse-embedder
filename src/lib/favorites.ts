
import { supabase } from "@/integrations/supabase/client";

// Legacy exports for backward compatibility
export const addToFavorites = async (
  userId: string,
  itemId: number,
  itemType: 'movie' | 'tv',
  title: string,
  posterPath?: string
) => {
  const result = await toggleFavorite({
    mediaId: itemId.toString(),
    mediaType: itemType,
    title,
    posterPath: posterPath || null,
  });
  return result.isFavorite;
};

export const removeFromFavorites = async (
  userId: string,
  itemId: number,
  itemType: 'movie' | 'tv'
) => {
  const result = await toggleFavorite({
    mediaId: itemId.toString(),
    mediaType: itemType,
    title: "", // Not needed for removal
    posterPath: null,
  });
  return !result.isFavorite;
};

export const checkIsFavorite = async (
  userId: string,
  itemId: number,
  itemType: 'movie' | 'tv'
) => {
  const result = await checkFavoriteStatus({
    mediaId: itemId.toString(),
    mediaType: itemType,
  });
  return result.isFavorite;
};

export const getUserFavorites = async (userId: string) => {
  const favorites = await getFavorites();
  return favorites.map(fav => ({
    id: parseInt(fav.mediaId),
    type: fav.mediaType,
    title: fav.title,
    poster_path: fav.posterPath,
    added_at: fav.addedAt,
  }));
};

export interface FavoriteItem {
  id: string;
  userId: string;
  mediaId: string;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  addedAt: string;
}

/**
 * Toggle favorite status for a media item
 */
export async function toggleFavorite({
  mediaId,
  mediaType,
  title,
  posterPath,
}: {
  mediaId: string;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    // Check if favorite already exists
    const { data: existingFavorite } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", user.id)
      .eq("item_id", parseInt(mediaId))
      .eq("item_type", mediaType)
      .maybeSingle();

    if (existingFavorite) {
      // Remove from favorites
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", existingFavorite.id);

      if (error) throw error;
      return { success: true, isFavorite: false };
    } else {
      // Add to favorites
      const { error } = await supabase
        .from("favorites")
        .insert({
          user_id: user.id,
          item_id: parseInt(mediaId),
          item_type: mediaType,
          title,
          poster_path: posterPath,
        });

      if (error) throw error;
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
export async function getFavorites(): Promise<FavoriteItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });

    if (error) throw error;

    // Transform Supabase data to match expected format
    return (data || []).map((item) => ({
      id: item.id,
      userId: item.user_id,
      mediaId: item.item_id.toString(),
      mediaType: item.item_type as "movie" | "tv",
      title: item.title,
      posterPath: item.poster_path,
      addedAt: item.added_at,
    }));
  } catch (error) {
    console.error("Error fetching favorites:", error);
    throw new Error("Failed to fetch favorites");
  }
}

/**
 * Check if a media item is favorited
 */
export async function checkFavoriteStatus({
  mediaId,
  mediaType,
}: {
  mediaId: string;
  mediaType: "movie" | "tv";
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isFavorite: false };

  try {
    const { data, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_id", parseInt(mediaId))
      .eq("item_type", mediaType)
      .maybeSingle();

    if (error) throw error;
    return { isFavorite: !!data };
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return { isFavorite: false };
  }
}
