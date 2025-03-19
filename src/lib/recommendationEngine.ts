
import { Movie, TVShow, FavoriteItem } from "@/types";
import { getTrendingMovies, getTrendingTVShows, getMoviesByGenre, getTVShowsByGenre } from "@/lib/api";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";

// Type guard to check if an item is a Movie or TVShow
export const isMovie = (item: Movie | TVShow): item is Movie => {
  return 'title' in item;
};

// Helper function to get the title of a Movie or TVShow
export const getItemTitle = (item: Movie | TVShow): string => {
  return isMovie(item) ? item.title : item.name;
};

// Get the user's favorite items from Firestore
const getUserFavorites = async (user: User): Promise<FavoriteItem[]> => {
  try {
    const favoritesQuery = query(
      collection(db, "favorites"),
      where("userId", "==", user.uid)
    );
    
    const querySnapshot = await getDocs(favoritesQuery);
    
    const favorites: FavoriteItem[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.itemId,
        type: data.itemType,
        title: data.title,
        posterPath: data.posterPath,
        addedAt: new Date(data.addedAt).getTime()
      };
    });
    
    return favorites;
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    return [];
  }
};

// Extract genre IDs from a list of favorite items
const extractFavoriteGenres = async (favorites: FavoriteItem[]): Promise<number[]> => {
  // This would require additional API calls to get genre information for each favorite item
  // For simplicity, we'll use a predefined set of popular genres
  return [28, 12, 35, 18, 10749, 80]; // Action, Adventure, Comedy, Drama, Romance, Crime
};

// Get personalized recommendations based on user's favorite items
export const getPersonalizedRecommendations = async (
  user: User,
  limit: number = 10
): Promise<(Movie | TVShow)[]> => {
  try {
    // Get user's favorite items
    const favorites = await getUserFavorites(user);
    
    if (favorites.length === 0) {
      // If user has no favorites, return trending content
      const [trendingMovies, trendingTVShows] = await Promise.all([
        getTrendingMovies(),
        getTrendingTVShows()
      ]);
      
      const combinedResults = [
        ...(trendingMovies?.results || []),
        ...(trendingTVShows?.results || [])
      ];
      
      return combinedResults.slice(0, limit);
    }
    
    // Extract genre IDs from favorite items
    const genreIds = await extractFavoriteGenres(favorites);
    
    // Get recommendations based on genres
    const [movieRecommendations, tvRecommendations] = await Promise.all([
      getMoviesByGenre(genreIds[0] || 28),
      getTVShowsByGenre(genreIds[1] || 18)
    ]);
    
    // Combine and filter out items the user has already favorited
    const favoriteIds = favorites.map(fav => fav.id);
    
    const combinedResults = [
      ...(movieRecommendations?.results || []),
      ...(tvRecommendations?.results || [])
    ].filter(item => !favoriteIds.includes(item.id));
    
    // Return limited number of recommendations
    return combinedResults.slice(0, limit);
  } catch (error) {
    console.error("Error getting personalized recommendations:", error);
    return [];
  }
};
