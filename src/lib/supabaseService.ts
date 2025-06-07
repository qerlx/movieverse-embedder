
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface WatchProgress {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  poster_path?: string | null;
  progress?: number;
  lastEpisode?: {
    season: number;
    episode: number;
    name: string;
  };
  lastWatched: number;
  genres?: number[];
}

export interface FavoriteItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  poster_path?: string | null;
  addedAt: number;
}

export const addToWatchHistory = async (user: User, watchData: Omit<WatchProgress, "lastWatched">) => {
  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  try {
    const { data, error } = await supabase
      .from('watch_history')
      .upsert({
        user_id: user.id,
        item_id: watchData.id,
        item_type: watchData.type,
        title: watchData.title,
        poster_path: watchData.posterPath,
        progress: watchData.progress || 0,
        last_episode: watchData.lastEpisode,
        genres: watchData.genres || [],
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating watch history:", error);
    throw error;
  }
};

export const getWatchHistory = async (user: User): Promise<WatchProgress[]> => {
  if (!user?.id) return [];

  try {
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.item_id,
      type: item.item_type as "movie" | "tv",
      title: item.title,
      posterPath: item.poster_path,
      poster_path: item.poster_path,
      progress: item.progress || 0,
      lastEpisode: item.last_episode,
      lastWatched: new Date(item.updated_at).getTime(),
      genres: item.genres || []
    }));
  } catch (error) {
    console.error("Error fetching watch history:", error);
    return [];
  }
};

export const getRecentlyWatched = async (user: User, limit = 6): Promise<WatchProgress[]> => {
  if (!user?.id) return [];

  try {
    const watchHistory = await getWatchHistory(user);
    return watchHistory.slice(0, limit);
  } catch (error) {
    console.error("Error fetching recently watched:", error);
    return [];
  }
};

export const getWatchProgress = async (user: User, type: "movie" | "tv", id: number) => {
  if (!user?.id) return null;

  try {
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', user.id)
      .eq('item_id', id)
      .eq('item_type', type)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) return null;

    return {
      id: data.item_id,
      type: data.item_type as "movie" | "tv",
      title: data.title,
      posterPath: data.poster_path,
      poster_path: data.poster_path,
      progress: data.progress || 0,
      lastEpisode: data.last_episode,
      lastWatched: new Date(data.updated_at).getTime(),
      genres: data.genres || []
    };
  } catch (error) {
    console.error("Error fetching watch progress:", error);
    return null;
  }
};

export const updateWatchProgress = async (user: User, type: "movie" | "tv", id: number, progress: number) => {
  if (!user?.id) return false;

  try {
    const { error } = await supabase
      .from('watch_history')
      .update({ 
        progress,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('item_id', id)
      .eq('item_type', type);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating watch progress:", error);
    return false;
  }
};

export const addToFavorites = async (user: User, itemData: Omit<FavoriteItem, "addedAt">) => {
  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        item_id: itemData.id,
        item_type: itemData.type,
        title: itemData.title,
        poster_path: itemData.posterPath
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
};

export const removeFromFavorites = async (user: User, type: "movie" | "tv", id: number) => {
  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('item_id', id)
      .eq('item_type', type);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
};

export const getFavorites = async (user: User): Promise<FavoriteItem[]> => {
  if (!user?.id) return [];

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.item_id,
      type: item.item_type as "movie" | "tv",
      title: item.title,
      posterPath: item.poster_path,
      poster_path: item.poster_path,
      addedAt: new Date(item.added_at).getTime()
    }));
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
};

export const checkIsFavorite = async (userId: string, itemId: number, itemType: string): Promise<boolean> => {
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
};
